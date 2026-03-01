/**
 * QR / NFC Scan API Tests
 *
 * Covers:
 *  - POST /api/scan/qr  (happy path, direction toggling, unknown QR, missing fields)
 *  - POST /api/scan/nfc (happy path, unknown card, missing fields)
 *  - GET  /api/students/:id/current-location
 *
 * Two separate students are created — one exclusively for QR tests,
 * one exclusively for NFC tests — so direction state never cross-contaminates.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

const API = process.env.VITE_API_URL ?? "http://localhost:4000";

const SUPER_EMAIL = "team@hallguardian.com";
const SUPER_PASSWORD = "HallGuardian@2024!";
const LOCATION_CODE = "HALLWAY-B";

let token: string;
let schoolId: number;
let qrStudentId: number;
let nfcStudentId: number;

const QR_VALUE = `SCAN-QR-${Date.now()}`;
const NFC_UID = `NFC-${Date.now()}`;

function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function scan(endpoint: "qr" | "nfc", payload: Record<string, unknown>) {
    return fetch(`${API}/api/scan/${endpoint}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    });
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
    if (!loginRes.ok) throw new Error("Could not log in as super-admin for scan tests.");
    token = (await loginRes.json()).token;

    // Create a real school (FK constraint)
    const schoolRes = await fetch(`${API}/api/test/school`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            name: `Scan Test School ${Date.now()}`,
            short_code: `SC${Date.now().toString().slice(-6)}`,
        }),
    });
    if (!schoolRes.ok) throw new Error(`Could not create test school: ${schoolRes.status}`);
    schoolId = (await schoolRes.json()).school.id;

    // Create dedicated QR student
    const qrRes = await fetch(`${API}/api/students`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            schoolId,
            school_id_no: `QR-STU-${Date.now()}`,
            full_name: "QR Testington",
            grade: "10",
            qr_value: QR_VALUE,
        }),
    });
    if (!qrRes.ok) throw new Error(`Could not create QR test student: ${qrRes.status}`);
    qrStudentId = (await qrRes.json()).student.id;

    // Create dedicated NFC student
    const nfcRes = await fetch(`${API}/api/students`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            schoolId,
            school_id_no: `NFC-STU-${Date.now()}`,
            full_name: "NFC Testington",
            grade: "11",
            card_uid: NFC_UID,
        }),
    });
    if (!nfcRes.ok) throw new Error(`Could not create NFC test student: ${nfcRes.status}`);
    nfcStudentId = (await nfcRes.json()).student.id;
});

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterAll(async () => {
    if (!token) return;
    const ids = [qrStudentId, nfcStudentId].filter(Boolean);
    await Promise.allSettled(
        ids.map((id) =>
            fetch(`${API}/api/students/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }),
        ),
    );
});

// ── QR Scan ───────────────────────────────────────────────────────────────────
describe("POST /api/scan/qr", () => {
    it("processes a valid QR scan and returns direction IN (first scan)", async () => {
        const res = await scan("qr", { qrValue: QR_VALUE, locationCode: LOCATION_CODE, schoolId });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.direction).toBe("IN");
        expect(body.source).toBe("QR");
        expect(body.student.id).toBe(qrStudentId);
        expect(typeof body.eventId).toBe("number");
    });

    it("second QR scan returns direction OUT", async () => {
        const res = await scan("qr", { qrValue: QR_VALUE, locationCode: LOCATION_CODE, schoolId });
        expect(res.status).toBe(200);
        expect((await res.json()).direction).toBe("OUT");
    });

    it("direction alternates on consecutive scans", async () => {
        // Fire two back-to-back scans and verify they have opposite directions
        const firstRes = await scan("qr", { qrValue: QR_VALUE, locationCode: LOCATION_CODE, schoolId });
        expect(firstRes.status).toBe(200);
        const firstDir = (await firstRes.json()).direction;

        const secondRes = await scan("qr", { qrValue: QR_VALUE, locationCode: LOCATION_CODE, schoolId });
        expect(secondRes.status).toBe(200);
        const secondDir = (await secondRes.json()).direction;

        // They must be opposite — this is the core toggle invariant
        expect(firstDir).not.toBe(secondDir);
        expect(["IN", "OUT"]).toContain(firstDir);
        expect(["IN", "OUT"]).toContain(secondDir);
    });

    it("returns 404 for an unknown QR value", async () => {
        const res = await scan("qr", { qrValue: "DOES-NOT-EXIST", locationCode: LOCATION_CODE, schoolId });
        expect(res.status).toBe(404);
        expect((await res.json()).error).toMatch(/not found/i);
    });

    it("returns 400 when required fields are missing", async () => {
        const res = await scan("qr", { qrValue: QR_VALUE }); // no locationCode / schoolId
        expect(res.status).toBe(400);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/scan/qr`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrValue: QR_VALUE, locationCode: LOCATION_CODE, schoolId }),
        });
        expect(res.status).toBe(401);
    });
});

// ── NFC Scan ──────────────────────────────────────────────────────────────────
describe("POST /api/scan/nfc", () => {
    it("processes a valid NFC scan and returns direction IN (first scan)", async () => {
        const res = await scan("nfc", { cardUid: NFC_UID, locationCode: LOCATION_CODE, schoolId });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.direction).toBe("IN");
        expect(body.source).toBe("NFC");
        expect(body.student.id).toBe(nfcStudentId);
    });

    it("second NFC scan returns direction OUT", async () => {
        const res = await scan("nfc", { cardUid: NFC_UID, locationCode: LOCATION_CODE, schoolId });
        expect(res.status).toBe(200);
        expect((await res.json()).direction).toBe("OUT");
    });

    it("returns 404 for an unknown NFC card UID", async () => {
        const res = await scan("nfc", { cardUid: "UNKNOWN-CARD", locationCode: LOCATION_CODE, schoolId });
        expect(res.status).toBe(404);
    });

    it("returns 400 when required fields are missing", async () => {
        const res = await scan("nfc", { cardUid: NFC_UID }); // no locationCode / schoolId
        expect(res.status).toBe(400);
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/scan/nfc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cardUid: NFC_UID, locationCode: LOCATION_CODE, schoolId }),
        });
        expect(res.status).toBe(401);
    });
});

// ── Current Location ──────────────────────────────────────────────────────────
describe("GET /api/students/:id/current-location", () => {
    it("returns a current-location response for the QR student", async () => {
        const res = await fetch(`${API}/api/students/${qrStudentId}/current-location`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty("studentId");
        expect(["IN_LOCATION", "OUT_OF_LOCATION", "NO_SCANS"]).toContain(body.status);
    });

    it("returns NO_SCANS for a student that has never been scanned", async () => {
        const res = await fetch(`${API}/api/students/99999999/current-location`, {
            headers: authHeaders(),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.status).toBe("NO_SCANS");
    });

    it("returns 401 when unauthenticated", async () => {
        const res = await fetch(`${API}/api/students/${qrStudentId}/current-location`);
        expect(res.status).toBe(401);
    });
});
