const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestInit } = options;

  const request: RequestInit = {
    ...requestInit,
    credentials: "include",
    headers: {
      ...(body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    request.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, request);

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "object" &&
        data.error !== null &&
        "message" in data.error &&
        typeof data.error.message === "string"
        ? data.error.message
        : `API request failed with status ${response.status}`,
    );
  }

  return data as T;
}