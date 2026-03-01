/**
 * Health Check Tests
 * Verifies the backend is running and reachable before any other tests run.
 */

import { describe, it, expect } from "vitest";

const API = process.env.VITE_API_URL ?? "http://localhost:4000";

describe("Backend Health Check", () => {
    it("GET /api/health returns ok:true and a timestamp", async () => {
        let res: Response;
        try {
            res = await fetch(`${API}/api/health`);
        } catch (err) {
            throw new Error(
                `❌ Could not reach backend at ${API}. ` +
                `Make sure the server is running: cd HallGuardian && node server.js\n\nOriginal error: ${err}`,
            );
        }

        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toMatchObject({ ok: true });
        expect(typeof body.time).toBe("string");

        // Sanity-check: timestamp should be recent (within the last 10 seconds)
        const serverTime = new Date(body.time).getTime();
        expect(Date.now() - serverTime).toBeLessThan(10_000);
    });
});
