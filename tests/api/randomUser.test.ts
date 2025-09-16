// tests/api/randomUser.test.ts
import { test, expect } from '@playwright/test';
import {
    expectResults,
    expectGender,
    expectError,
    expectNatsInSet,
    expectOnlyTopLevelKeys,
    expectNoKey,
} from '../utils/assertions';
import { paramsExamples } from '../utils/testParams';
import { asParams } from '../utils/apiRequest';

// helper for pagination comparison
const extractUUIDs = (body: any) =>
    Array.isArray(body?.results)
        ? body.results.map((u: any) => u?.login?.uuid).filter(Boolean)
        : [];

test.describe('Random User API', () => {
    test.describe.parallel('gender parameter', () => {
        const cases = [
            { name: 'female', params: { ...paramsExamples.female, results: 10 } },
            { name: 'male', params: { ...paramsExamples.male, results: 10 } },
        ];

        for (const { name, params } of cases) {
            test(`returns only ${name} users`, async ({ request }) => {
                const res = await request.get('', { params: asParams(params) });
                await expectGender(res, name as 'male' | 'female');
            });
        }

        test('invalid gender returns mixed results', async ({ request }) => {
            const res = await request.get('', { params: asParams(paramsExamples.genderInvalid) });
            expect(res.ok()).toBeTruthy();
            const body = await res.json();
            const set = new Set(body.results.map((u: any) => u.gender));
            expect(['male', 'female']).toEqual(expect.arrayContaining([...set]));
        });
    });

    test.describe('password parameter', () => {
        const cases = [
            {
                name: 'simple (upper/lower, 1–16)',
                params: { ...paramsExamples.passwordSimple, results: 10, inc: 'login' },
                min: 1,
                max: 16,
                must: /[A-Za-z]/,
            },
            {
                name: 'special (exactly 32)',
                params: { ...paramsExamples.passwordSpecial, results: 10, inc: 'login' },
                min: 32,
                max: 32,
                must: /[^A-Za-z0-9]/,
            },
            {
                name: 'complex (special+upper+lower+number, 8–64)',
                params: { ...paramsExamples.passwordComplex, results: 10, inc: 'login' },
                min: 8,
                max: 64,
                // no `must` regex here; handled in test body
            },
        ];

        for (const { name, params, min, max, must } of cases) {
            test(`generates ${name} passwords`, async ({ request }) => {
                const res = await request.get('', { params: asParams(params) });
                expect(res.ok()).toBeTruthy();
                const body = await res.json();

                for (const u of body.results) {
                    const pwd: string = u.login.password;
                    expect(pwd.length).toBeGreaterThanOrEqual(min);
                    expect(pwd.length).toBeLessThanOrEqual(max);

                    if (name.startsWith('complex')) {
                        // union of allowed charsets: special + upper + lower + number
                        const allowedUnion =
                            /^[A-Za-z0-9!"#$%&'()*+,\- .\/:;<=>?@\[\\\]^_`{|}~]+$/;
                        expect(pwd).toMatch(allowedUnion);
                    } else {
                        expect(pwd).toMatch(must as RegExp);
                    }
                }
            });
        }
    });

    test.describe('results parameter', () => {
        for (const n of [1, 2, 5, 10]) {
            test(`returns ${n} users`, async ({ request }) => {
                const res = await request.get('', { params: asParams({ results: n }) });
                await expectResults(res, n);
            });
        }
    });

    test.describe('nat & inc/exc', () => {
        test('limits nationality to a set', async ({ request }) => {
            const res = await request.get('', { params: asParams(paramsExamples.natMulti) });
            await expectNatsInSet(res, ['US', 'DK', 'FR', 'GB']);
        });

        test('inc returns only requested top-level fields', async ({ request }) => {
            const res = await request.get('', { params: asParams(paramsExamples.includeBasic) });
            await expectOnlyTopLevelKeys(res, ['gender', 'name', 'nat']);
        });

        test('exc removes excluded field', async ({ request }) => {
            const res = await request.get('', { params: asParams(paramsExamples.excludeLogin) });
            await expectNoKey(res, 'login');
        });
    });

    test.describe('seed & pagination determinism', () => {
        test('same seed+page yields identical results', async ({ request }) => {
            const params = { seed: 'abc123', page: 2, results: 5 };
            const r1 = await request.get('', { params: asParams(params) });
            const r2 = await request.get('', { params: asParams(params) });

            expect(r1.ok()).toBeTruthy();
            expect(r2.ok()).toBeTruthy();

            const b1 = await r1.json();
            const b2 = await r2.json();

            // Don’t hardcode page; just check consistency
            expect(b1.info?.page).toBe(b2.info?.page);
            expect(b1.info?.seed).toBe(b2.info?.seed);

            if (!Array.isArray(b1.results) || !Array.isArray(b2.results)) {
                throw new Error(`Unexpected shape:\n${JSON.stringify({ b1, b2 }, null, 2)}`);
            }

            expect(b1).toEqual(b2);
        });


    });

    test('invalid API path returns an error', async ({ request }) => {
        const res = await request.get('does-not-exist');
        await expectError(res);
    });
});
