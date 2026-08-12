import { SUPPORT_URL, SUPPORT_LABEL } from "../lib/config";

// Unintrusive "support the site" link. Renders nothing until SUPPORT_URL is set
// in lib/config.ts, so there's never a broken/dead link. Includes its own
// leading separator so it slots into an existing footer line cleanly.
export default function SupportLink() {
  if (!SUPPORT_URL) return null;
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
