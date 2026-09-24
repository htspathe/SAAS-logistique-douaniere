export function safeRedirectPath(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  ) {
    return "/dashboard";
  }

  // Normalise dot segments and only allow application destinations. This also
  // avoids redirecting a newly signed-in user back into the auth callbacks.
  const url = new URL(value, "https://transitflow.invalid");
  if (
    url.origin !== "https://transitflow.invalid" ||
    (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/"))
  ) {
    return "/dashboard";
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
