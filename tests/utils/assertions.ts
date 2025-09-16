import { APIResponse, expect } from '@playwright/test';

async function parseJSON(response: APIResponse) {
  expect(response.status(), 'unexpected HTTP status').toBeGreaterThanOrEqual(200);
  expect(response.status(), 'unexpected HTTP status').toBeLessThan(300);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Response was not JSON:\n${text}`);
  }
}

export async function expectResults(response: APIResponse, count: number) {
  expect(response.ok()).toBeTruthy();
  const data = await parseJSON(response);
  if (!Array.isArray(data.results)) {
    throw new Error(`Response has no results array:\n${JSON.stringify(data, null, 2)}`);
  }
  expect(data.results).toHaveLength(count);
}

export async function expectGender(response: APIResponse, gender: 'male' | 'female') {
  expect(response.ok()).toBeTruthy();
  const data = await parseJSON(response);
  expect(Array.isArray(data.results)).toBeTruthy();
  for (const u of data.results) expect(u.gender).toBe(gender);
}

export async function expectError(response: APIResponse) {
  expect(response.status()).toBeGreaterThanOrEqual(400);
  const ct = (response.headers()['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) {
    const data = await parseJSON(response);
    if (data && typeof data === 'object') {
      expect(data.error ?? '').toBeDefined();
    }
  }
}

export async function expectNatsInSet(response: APIResponse, allowed: string[]) {
  const data = await parseJSON(response);
  const set = new Set(data.results.map((u: any) => u.nat));
  for (const n of set) expect(allowed).toContain(n);
}

export async function expectOnlyTopLevelKeys(response: APIResponse, keys: string[]) {
  const data = await parseJSON(response);
  const expected = [...keys].sort();
  for (const u of data.results) {
    const got = Object.keys(u).sort();
    expect(got).toEqual(expected);
  }
}

export async function expectNoKey(response: APIResponse, key: string) {
  const data = await parseJSON(response);
  for (const u of data.results) {
    expect(u[key]).toBeUndefined();
  }
}
