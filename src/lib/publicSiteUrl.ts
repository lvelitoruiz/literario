/**
 * URL pública del sitio (para enlaces canónicos, Open Graph, Cusdis, etc.).
 * Prioridad: NEXT_PUBLIC_SITE_URL → Vercel → localhost.
 */
export function publicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
