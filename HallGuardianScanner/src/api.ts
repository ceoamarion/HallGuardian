// ─── HallGuardian API client ──────────────────────────────────────────────────
// Edit BASE_URL to match your backend URL (LAN IP when testing on device)

export const BASE_URL = "http://10.127.58.77:4000";

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResult {
    success: boolean;
    token: string;
    user: { id: number; email: string; role: string; schoolId: number };
}

export function apiLogin(email: string, password: string) {
    return request<LoginResult>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// ─── Scan ─────────────────────────────────────────────────────────────────────
export interface ScanResult {
    success: boolean;
    eventId: number;
    student: { id: number; name: string; school_id: number };
    location: { id: number; name: string; code: string };
    direction: "IN" | "OUT";
    source: "QR" | "NFC";
}

export function apiScanQR(
    token: string,
    qrValue: string,
    locationCode: string,
    schoolId: number,
    deviceLabel?: string
) {
    return request<ScanResult>(
        "/api/scan/qr",
        {
            method: "POST",
            body: JSON.stringify({ qrValue, locationCode, schoolId, deviceLabel }),
        },
        token
    );
}

// ─── Dashboard: who's out right now ──────────────────────────────────────────
export interface OutEntry {
    student_id: number;
    full_name: string;
    location_name: string;
    location_code: string;
    direction: "OUT";
    scanned_at: string;
}

export interface CurrentOutResult {
    schoolId: number;
    count: number;
    outOfClass: OutEntry[];
}

export function apiGetCurrentOut(token: string, schoolId: number) {
    return request<CurrentOutResult>(
        `/api/schools/${schoolId}/current-out`,
        {},
        token
    );
}
