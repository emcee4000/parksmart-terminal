import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <div className="text-6xl font-bold font-mono mb-4">404</div>
        <div className="text-xs text-muted-foreground font-mono mb-6">
          <span className="text-[var(--term-red)]">ERROR</span>: Page not found
          — no route matches the requested path.
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded px-5 py-2.5 text-sm font-mono hover:opacity-90 transition-opacity"
        >
          ← Back to terminal
        </Link>
      </div>
    </div>
  );
}
