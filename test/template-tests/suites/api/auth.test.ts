/**
 * Authentication API Tests
 *
 * Covers:
 *  - POST /api/auth/register  (happy path + duplicate email)
 *  - POST /api/auth/login     (happy path + wrong password + unknown email)
 *  - JWT token shape validation
 */

import { describe, it, expect, beforeAll } from "vitest";

const API = process.env.VITE_API_URL ?? "http://localhost:4000";

// Use a unique email per test-run so repeated runs don't fail on "already in use"
const TEST_EMAIL = `testuser_${Date.now()}@hallguardian-test.com`;
const TEST_PASSWORD = "TestPass1!";
const TEST_NAME = "Test User";

let authToken: string;

/** ---------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------- */
async function register(email: string, password: string, role = "SCHOOL_ADMIN") {
    return fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, fullName: TEST_NAME }),
    });
}

async function login(email: string, password: string) {
    return fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
}

/** ---------------------------------------------------------------------------
 * Guard: skip everything if the backend is down
 * --------------------------------------------------------------------------- */
beforeAll(async () => {
    try {
        await fetch(`${API}/api/health`);
    } catch {
        throw new Error(
            `Backend unreachable at ${API}. Start it with: cd HallGuardian && node server.js`,
        );
    }
});

/** ---------------------------------------------------------------------------
 * Registration
 * --------------------------------------------------------------------------- */
describe("POST /api/auth/register", () => {
    it("registers a new user and returns a userId", async () => {
        const res = await register(TEST_EMAIL, TEST_PASSWORD);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.success).toBe(true);
        expect(typeof body.userId).toBe("number");
    });

    it("rejects registration with a duplicate email", async () => {
        // Register the same email again — should fail
        const res = await register(TEST_EMAIL, TEST_PASSWORD);
        expect(res.status).toBe(400);

        const body = await res.json();
        expect(body.error).toMatch(/email already in use/i);
    });

    it("rejects registration when required fields are missing", async () => {
        const res = await fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "nopass@test.com" }), // missing password & role
        });
        expect(res.status).toBe(400);

        const body = await res.json();
        expect(body).toHaveProperty("error");
    });
});

/** ---------------------------------------------------------------------------
 * Login
 * --------------------------------------------------------------------------- */
describe("POST /api/auth/login", () => {
    it("logs in with valid credentials and returns a JWT", async () => {
        const res = await login(TEST_EMAIL, TEST_PASSWORD);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.success).toBe(true);
        expect(typeof body.token).toBe("string");

        // JWT should be three base64url parts separated by dots
        const parts = body.token.split(".");
        expect(parts).toHaveLength(3);

        // Remember for subsequent tests
        authToken = body.token;
    });

    it("returns user profile in the login response", async () => {
        const res = await login(TEST_EMAIL, TEST_PASSWORD);
        const body = await res.json();

        expect(body.user).toMatchObject({
            email: TEST_EMAIL,
            role: "SCHOOL_ADMIN",
        });
        expect(typeof body.user.id).toBe("number");
    });

    it("rejects login with wrong password", async () => {
        const res = await login(TEST_EMAIL, "WrongPassword99!");
        expect(res.status).toBe(401);

        const body = await res.json();
        expect(body.error).toMatch(/invalid email or password/i);
    });

    it("rejects login for an unknown email", async () => {
        const res = await login("nobody@nowhere.com", TEST_PASSWORD);
        expect(res.status).toBe(401);

        const body = await res.json();
        expect(body.error).toMatch(/invalid email or password/i);
    });

    it("rejects login when fields are missing", async () => {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: TEST_EMAIL }), // no password
        });
        expect(res.status).toBe(400);
    });
});

/** ---------------------------------------------------------------------------
 * Auth token used downstream
 * --------------------------------------------------------------------------- */
export { TEST_EMAIL, TEST_PASSWORD, authToken };
