function required(value: string | undefined, name: string): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const apiBaseUrl = required(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "NEXT_PUBLIC_API_BASE_URL"
);

if (!isHttpUrl(apiBaseUrl)) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid http(s) URL");
}

export const env = {
  apiBaseUrl,
};