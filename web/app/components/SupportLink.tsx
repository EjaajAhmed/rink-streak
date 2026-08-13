import { SUPPORT_URL, SUPPORT_LABEL } from "../lib/config";

// Unintrusive "support the site" link. Renders nothing until SUPPORT_URL is set
// in lib/config.ts, so there's never a broken/dead link.
//  - "footer" (default): inline text with its own leading separator.
//  - "header": a standalone compact link that matches the top-bar affordances.
export default function SupportLink({
  variant = "footer",
}: {
  variant?: "footer" | "header";
}) {
  if (!SUPPORT_URL) return null;

  if (variant === "header") {
    return (
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.7rem] font-semibold uppercase tracking-widest text-ink-soft hover:text-team"
      >
        ♥ Support
      </a>
    );
  }

  return (
    <>
      {" · "}
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap text-team hover:underline"
      >
        ♥ {SUPPORT_LABEL}
      </a>
    </>
  );
}
