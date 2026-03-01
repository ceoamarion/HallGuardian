/**
 * Dashboard / School API Tests
 *
 * Covers:
 *  - GET /api/schools/:id/current-out   (the endpoint the dashboard polls)
 *  - GET /api/locations                 (location list)
 *  - POST /api/locations                (location creation)
 *  - GET /api/locations/:id/occupants   (who is currently IN a location)
 */

import { describe, it, expect, beforeAll } from "vitest";

const API = process.env.VITE_API_URL ?? "http://localhost:4000";

const SUPER_EMAIL = "team@hallguardian.com";
const SUPER_PASSWORD = "HallGuardian@2024!";

let token: string;
let schoolId: number;
let createdLocationId: number;

function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function createTestSchool(): Promise<number> {
    const res = await fetch(`${API}/api/schools`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            name: `Test School Dashboard ${Date.now()}`,
            short_code: `TSD${Date.now().toString().slice(-6)}`,
            plan: "FREE",
        }),
    });

    if (res.ok) {
        const body = await res.json();
        return body.school?.id ?? body.id;
    }

    const res2 = await fetch(`${API}/api/test/school`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: `Test School Dashboard ${Date.now()}`, short_code: `TSD${Date.now().toString().slice(-6)}` }),
    });

    if (res2.ok) {
        const body2 = await res2.json();
        return body2.school?.id ?? body2.id;
    }

    throw new Error(
        "Cannot create a test school — locations require a valid school_id (FK constraint). " +
        `POST /api/schools returned ${res.status}, POST /api/test/school returned ${res2.status}.`,
    );
}

// ── Setup ──────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    try {
        await fetch(`${API}/api/health`);
    } catch {
        throw new Error(`Backend unreachable at ${API}. Start it with: cd HallGuardian && node server.js`);
    }

    const loginRes = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: SUPER_EMAIL, password: SUPER_PASSWORD }),
    });
    if (!loginRes.ok) throw new Error("Could not log in as super-admin for dashboard tests.");
    token = (await loginRes.json()).token;

    schoolId = await createTestSchool();
});

// ── School: current-out ───────────────────────────────────────────────────────
describe("GET /api/schools/:id/current-out", () => {
    it("returns a valid response shape", async () => {
        const res = await fetch(`${API}/api/schools/${schoolId}/current-out`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("schoolId");
        expect(typeof body.count).toBe("number");
        expect(Array.isArray(body.outOfClass)).toBe(true);
    });

    it("count matches the length of outOfClass array", async () => {
        const res = await fetch(`${API}/api/schools/${schoolId}/current-out`, {
            headers: authHeaders(),
        });
        const body = await res.json();
        expect(body.count).toBe(body.outOfClass.length);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/schools/${schoolId}/current-out`);
        expect(res.status).toBe(401);
    });
});

// ── Locations ─────────────────────────────────────────────────────────────────
describe("POST /api/locations", () => {
    it("creates a new location and returns it", async () => {
        const CODE = `TEST-LOC-${Date.now()}`;
        const res = await fetch(`${API}/api/locations`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                schoolId,
                name: "Test Bathroom",
                code: CODE,
                type: "BATHROOM",
            }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.location).toMatchObject({
            school_id: schoolId,
            code: CODE,
            type: "BATHROOM",
        });

        createdLocationId = body.location.id;
        expect(typeof createdLocationId).toBe("number");
    });

    it("returns 400 when required fields are missing", async () => {
        const res = await fetch(`${API}/api/locations`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ schoolId }), // missing name and code
        });
        expect(res.status).toBe(400);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/locations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schoolId, name: "X", code: "Y" }),
        });
        expect(res.status).toBe(401);
    });
});

describe("GET /api/locations", () => {
    it("lists locations for the school and includes the one we created", async () => {
        const res = await fetch(`${API}/api/locations?schoolId=${schoolId}`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);

        if (createdLocationId) {
            const found = body.find((l: any) => l.id === createdLocationId);
            expect(found).toBeDefined();
        }
    });

    it("returns 400 when schoolId is missing", async () => {
        const res = await fetch(`${API}/api/locations`, { headers: authHeaders() });
        expect(res.status).toBe(400);
    });
});

// ── Location Occupants ────────────────────────────────────────────────────────
describe("GET /api/locations/:id/occupants", () => {
    it("returns a valid occupant response for the created location", async () => {
        if (!createdLocationId) {
            console.warn("Skipping occupants test: no location was created.");
            return;
        }

        const res = await fetch(`${API}/api/locations/${createdLocationId}/occupants`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toMatchObject({
            locationId: String(createdLocationId),
            count: expect.any(Number),
            occupants: expect.any(Array),
        });
        expect(body.count).toBe(body.occupants.length);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/locations/1/occupants`);
        expect(res.status).toBe(401);
    });
});
