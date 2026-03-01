/**
 * Students API Tests
 *
 * Covers:
 *  - POST /api/students  (create)
 *  - GET  /api/students  (list)
 *  - PUT  /api/students/:id  (update)
 *  - DELETE /api/students/:id  (delete)
 *
 * We first create a real school record (required by the FK constraint) using
 * a direct SQL insert proxied through the super-admin login, then run CRUD tests.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

const API = process.env.VITE_API_URL ?? "http://localhost:4000";

const SUPER_EMAIL = "team@hallguardian.com";
const SUPER_PASSWORD = "HallGuardian@2024!";

let token: string;
let schoolId: number;
let createdStudentId: number;
const STUDENT_UNIQUE = `QR-STUDENT-${Date.now()}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/** Insert a test school via the super-admin school-creation endpoint (if it exists)
 *  or fall back to a direct POST to the internal test helper route. */
async function createTestSchool(): Promise<number> {
    // Try POST /api/schools first (super-admin only)
    const res = await fetch(`${API}/api/schools`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            name: `Test School Students ${Date.now()}`,
            short_code: `TSS${Date.now().toString().slice(-6)}`,
            plan: "FREE",
        }),
    });

    if (res.ok) {
        const body = await res.json();
        // Accept either { school: { id } } or { id }
        return body.school?.id ?? body.id;
    }

    // If the route doesn't exist, try the DB-backed test-setup route
    const res2 = await fetch(`${API}/api/test/school`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: `Test School Students ${Date.now()}`, short_code: `TSS${Date.now().toString().slice(-6)}` }),
    });

    if (res2.ok) {
        const body2 = await res2.json();
        return body2.school?.id ?? body2.id;
    }

    throw new Error(
        `Cannot create a test school. Both POST /api/schools (${res.status}) ` +
        `and POST /api/test/school (${res2.status}) failed. ` +
        "The students API requires a valid school_id (FK constraint). " +
        "Add a school creation endpoint or seed one via the DB.",
    );
}

// ── Setup ──────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    // Backend reachability
    try {
        await fetch(`${API}/api/health`);
    } catch {
        throw new Error(`Backend unreachable at ${API}. Start it with: cd HallGuardian && node server.js`);
    }

    // Login as super-admin
    const loginRes = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: SUPER_EMAIL, password: SUPER_PASSWORD }),
    });
    if (!loginRes.ok) throw new Error("Could not log in as super-admin for student tests.");
    token = (await loginRes.json()).token;

    // Create a real school (needed for the FK constraint)
    schoolId = await createTestSchool();
});

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("POST /api/students", () => {
    it("creates a student with required fields", async () => {
        const res = await fetch(`${API}/api/students`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                schoolId,
                school_id_no: "S-001-TEST",
                full_name: "Alice Testington",
                grade: "10",
                qr_value: STUDENT_UNIQUE,
            }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.student).toMatchObject({
            full_name: "Alice Testington",
            school_id: schoolId,
            qr_value: STUDENT_UNIQUE,
        });

        createdStudentId = body.student.id;
        expect(typeof createdStudentId).toBe("number");
    });

    it("rejects creation when required fields are missing", async () => {
        const res = await fetch(`${API}/api/students`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ schoolId }), // missing school_id_no & full_name
        });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body).toHaveProperty("error");
    });

    it("returns 401 when no auth token is given", async () => {
        const res = await fetch(`${API}/api/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schoolId, school_id_no: "X", full_name: "Y" }),
        });
        expect(res.status).toBe(401);
    });
});

describe("GET /api/students", () => {
    it("lists students for a valid school", async () => {
        const res = await fetch(`${API}/api/students?schoolId=${schoolId}`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);

        // Our just-created student should be in the list
        const found = body.find((s: any) => s.qr_value === STUDENT_UNIQUE);
        expect(found).toBeDefined();
    });

    it("returns 400 when schoolId is omitted", async () => {
        const res = await fetch(`${API}/api/students`, {
            headers: authHeaders(),
        });
        expect(res.status).toBe(400);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/students?schoolId=${schoolId}`);
        expect(res.status).toBe(401);
    });
});

describe("PUT /api/students/:id", () => {
    it("updates a student's full name", async () => {
        if (!createdStudentId) {
            console.warn("Skipping update test: no student was created.");
            return;
        }

        const res = await fetch(`${API}/api/students/${createdStudentId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ full_name: "Alice Updated" }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.student.full_name).toBe("Alice Updated");
    });
});

describe("DELETE /api/students/:id", () => {
    it("deletes the student we created", async () => {
        if (!createdStudentId) return;

        const res = await fetch(`${API}/api/students/${createdStudentId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/students/9999`, {
            method: "DELETE",
        });
        expect(res.status).toBe(401);
    });
});
