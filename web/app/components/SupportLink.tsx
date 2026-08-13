import { SUPPORT_URL, SUPPORT_LABEL } from "../lib/config";

// Unintrusive "support the site" link. Renders nothing until SUPPORT_URL is set
// in lib/config.ts, so there's never a broken/dead link. Both variants slot into
// an existing line with their own leading separator.
//  - "footer"   : team-coloured, blends into the footer credits.
//  - "announce" : gold, to stand out inside the dark announcement bar.
export default function SupportLink({
  variant = "footer",
}: {
  variant?: "footer" | "announce";
}) {
  if (!SUPPORT_URL) return null;
  const cls =
    variant === "announce"
      ? "text-gold hover:underline"
      : "whitespace-nowrap text-team hover:underline";
  return (
    <>
      {" · "}
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={cls}>
        ♥ {SUPPORT_LABEL}
      </a>
    </>
  );
}
