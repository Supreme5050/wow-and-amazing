function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return trimTrailingSlash(configured.startsWith("http") ? configured : `https://${configured}`);

  if (typeof window !== "undefined") return trimTrailingSlash(window.location.origin);

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercelUrl) return trimTrailingSlash(vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`);

  return "http://localhost:3004";
}

export function getAuthCallbackUrl(nextPath: string) {
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
  return `${getPublicSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
