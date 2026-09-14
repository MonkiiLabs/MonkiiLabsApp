import { useState } from "react";

/**
 * The mark for a tokenized stock.
 *
 * Real company logos are trademarked and are not in the repo, so this looks
 * for one and degrades to a monogram in the company's own colour when it
 * does not find it. Dropping `public/stocks/nvda.svg` into place is the only
 * step needed to switch a ticker over; nothing here has to change.
 *
 * The monogram is not a placeholder in the apologetic sense. It is a
 * deliberate fallback: a coloured disc reads as an asset chip at 20px, keeps
 * the row scannable, and carries no trademark.
 */

/** Brand colour per ticker, for the monogram fallback. */
const TICKER_COLOR: Record<string, string> = {
  NVDA: "#76b900",
  TSLA: "#e82127",
  AAPL: "#1d1d1f",
  META: "#0866ff",
  SPY: "#c8102e",
  AMZN: "#ff9900",
};

const DEFAULT_COLOR = "#5d6b7a";

export function StockLogo({
  symbol,
  size = 20,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ticker = symbol.toUpperCase();
  const color = TICKER_COLOR[ticker] ?? DEFAULT_COLOR;

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: Math.round(size * 0.46),
        }}
      >
        {ticker.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={`/stocks/${ticker.toLowerCase()}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-full object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default StockLogo;
