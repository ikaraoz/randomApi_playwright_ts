import { request, APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Create a reusable API context for RandomUser.
 */
export async function getApiContext(): Promise<APIRequestContext> {
  return await request.newContext({
  });
}

/**
 * Safely stringify query params for Playwright requests.
 */
export function asParams(obj: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, String(v)])
  );
}

/**
 * Optional: wrapper for GET with stringified params.
 */
export async function get(
  api: APIRequestContext,
  path: string,
  params?: Record<string, unknown>
): Promise<APIResponse> {
  return api.get(path, { params: params ? asParams(params) : undefined });
}

/**
 * Optional: GET + parse JSON with better error reporting.
 */
export async function getJSON<T = any>(
  api: APIRequestContext,
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  const res = await get(api, path, params);
  expect(res.ok(), `HTTP ${res.status()} on GET ${path}`).toBeTruthy();
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Response was not JSON for ${path}:\n${text}`);
  }
}
