import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path !== "/health" && req.path !== "/") {
      console.log(`[http] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
}

export function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  try {
    const originHost = new URL(origin).hostname;
    for (const allowed of allowedOrigins) {
      if (allowed === "*") return true;
      try {
        const allowedHost = new URL(allowed.includes("://") ? allowed : `https://${allowed}`).hostname;
        const normOrigin = originHost.replace(/^www\./, "");
        const normAllowed = allowedHost.replace(/^www\./, "");
        if (normOrigin === normAllowed) return true;
      } catch {
        if (origin === allowed) return true;
      }
    }
  } catch {}
  return false;
}

export function handler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function parseBody<T>(schema: z.ZodType<T>, req: Request, res: Response): T | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "invalid_body",
      details: result.error.issues.map((e: any) => ({ path: e.path.join("."), message: e.message })),
    });
    return null;
  }
  return result.data;
}
