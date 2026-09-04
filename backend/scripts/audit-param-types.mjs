#!/usr/bin/env node
/**
 * Audit for PostgreSQL "inconsistent types deduced for parameter $N".
 *
 * Postgres deduces one type per placeholder from every position it appears
 * in. If the same $N is used against two columns whose types sit in
 * different families (text vs varchar, bigint vs uuid), the parse fails
 * before the query ever runs.
 *
 * This script builds a column type map from db/migrations, then resolves
 * every placeholder in every SQL string in src/ to the actual table.column
 * it touches, and reports the ones that disagree.
 *
 * Usage:  node scripts/audit-param-types.mjs
 * Exit 1 when conflicts are found, so it can gate CI.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

/* ---------- 1. column types from migrations --------------------------- */
const types = new Map(); // table -> Map(col -> type)

function addType(table, col, type) {
  if (!types.has(table)) types.set(table, new Map());
  // CREATE TABLE IF NOT EXISTS means the first definition applied wins.
  if (!types.get(table).has(col)) types.get(table).set(col, type.toUpperCase());
}

const migDir = join(ROOT, "db", "migrations");
for (const f of readdirSync(migDir).filter((n) => n.endsWith(".sql")).sort()) {
  const sql = readFileSync(join(migDir, f), "utf8");

  const createRe = /CREATE TABLE(?: IF NOT EXISTS)?\s+(\w+)\s*\(([\s\S]*?)\n\);/gi;
  for (const m of sql.matchAll(createRe)) {
    const table = m[1];
    for (const raw of m[2].split("\n")) {
      const line = raw.trim().replace(/,$/, "");
      const c = line.match(/^(\w+)\s+([A-Za-z]+(?:\s+\w+)?(?:\(\d+(?:,\s*\d+)?\))?)/);
      if (!c) continue;
      if (/^(PRIMARY|UNIQUE|FOREIGN|CONSTRAINT|CHECK)$/i.test(c[1])) continue;
      addType(table, c[1], c[2]);
    }
  }

  const alterRe =
    /ALTER TABLE\s+(\w+)\s+ADD COLUMN(?: IF NOT EXISTS)?\s+(\w+)\s+([A-Za-z]+(?:\s+\w+)?(?:\(\d+(?:,\s*\d+)?\))?)/gi;
  for (const m of sql.matchAll(alterRe)) addType(m[1], m[2], m[3]);
}

function family(type) {
  const t = type.toUpperCase();
  if (t.startsWith("VARCHAR") || t.startsWith("CHARACTER VARYING")) return "varchar";
  if (t.startsWith("TEXT")) return "text";
  if (t.startsWith("UUID")) return "uuid";
  if (/^(NUMERIC|DECIMAL|INTEGER|INT|BIGINT|SMALLINT|BIGSERIAL|SERIAL|REAL|DOUBLE)/.test(t))
    return "number";
  if (t.startsWith("TIMESTAMP") || t.startsWith("DATE")) return "timestamp";
  if (t.startsWith("BOOL")) return "boolean";
  if (t.startsWith("JSON")) return "json";
  return t.toLowerCase();
}

/* ---------- 2. walk source, pull SQL template literals ----------------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules") walk(p, out);
    } else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const conflicts = [];

for (const file of walk(join(ROOT, "src"))) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/`([^`]*?)`/gs)) {
    const q = m[1];
    if (!/\b(select|insert|update|delete|with)\b/i.test(q)) continue;

    // Tables referenced, with aliases.
    const alias = new Map();
    const tablesInQuery = new Set();
    const tableRe =
      /\b(?:FROM|JOIN|UPDATE|INSERT\s+INTO)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    for (const t of q.matchAll(tableRe)) {
      const table = t[1];
      if (!types.has(table)) continue;
      tablesInQuery.add(table);
      alias.set(table, table);
      const a = t[2];
      if (a && !/^(ON|SET|WHERE|VALUES|AS|SELECT|LEFT|RIGHT|INNER|OUTER|JOIN|GROUP|ORDER|LIMIT)$/i.test(a)) {
        alias.set(a, table);
      }
    }
    if (tablesInQuery.size === 0) continue;

    // placeholder -> Set("table.col")
    const hits = new Map();
    const add = (ph, table, col) => {
      if (!types.get(table)?.has(col)) return;
      if (!hits.has(ph)) hits.set(ph, new Set());
      hits.get(ph).add(`${table}.${col}`);
    };

    // alias.col = $N   /   col = $N
    for (const c of q.matchAll(/(?:(\w+)\.)?(\w+)\s*(?:=|<>|!=|>=|<=|>|<)\s*(\$\d+)(?!::)/g)) {
      const [, a, col, ph] = c;
      if (a) {
        const t = alias.get(a);
        if (t) add(ph, t, col);
      } else if (tablesInQuery.size === 1) {
        add(ph, [...tablesInQuery][0], col);
      } else {
        for (const t of tablesInQuery) add(ph, t, col);
      }
    }

    // INSERT INTO t (a, b) VALUES ($1, $2)
    const ins = q.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)/is);
    if (ins) {
      const table = ins[1];
      const cols = ins[2].split(",").map((s) => s.trim());
      const vals = ins[3].split(",").map((s) => s.trim());
      cols.forEach((col, i) => {
        const v = vals[i];
        const pm = v && v.match(/^(\$\d+)$/);
        if (pm) add(pm[1], table, col);
      });
    }

    for (const [ph, cols] of hits) {
      const fams = new Set([...cols].map((tc) => {
        const [t, c] = tc.split(".");
        return family(types.get(t).get(c));
      }));
      if (fams.size > 1) {
        conflicts.push({
          file: relative(ROOT, file),
          line: src.slice(0, m.index).split("\n").length,
          ph,
          cols: [...cols].map((tc) => {
            const [t, c] = tc.split(".");
            return `${tc} ${types.get(t).get(c)}`;
          }),
          fams: [...fams].sort(),
        });
      }
    }
  }
}

if (conflicts.length === 0) {
  console.log("No placeholder type conflicts found.");
  process.exit(0);
}

console.log(`Found ${conflicts.length} placeholder type conflict(s):\n`);
for (const c of conflicts) {
  console.log(`${c.file}:${c.line}  ${c.ph}  [${c.fams.join(" vs ")}]`);
  for (const col of c.cols) console.log(`    ${col}`);
  console.log();
}
process.exit(1);
