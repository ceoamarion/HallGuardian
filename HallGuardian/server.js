// server.js
// HallGuardian backend – QR/NFC + auth + basic admin APIs (ES module)

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import sqlite3pkg from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* -------------------------------------------------------------------------- */
/* ES module dirname shim                                                     */
/* -------------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */
const PORT = Number(process.env.PORT || 4000);
const DB_FILE = process.env.DB_FILE || "hallguardian.db";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

// ⚠️ Strongly recommended in production
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️ JWT_SECRET is not set. Using a dev default. Set JWT_SECRET in Render env vars!"
  );
}

/* -------------------------------------------------------------------------- */
/* SQLite setup                                                               */
/* -------------------------------------------------------------------------- */
const sqlite3 = sqlite3pkg.verbose();
const dbPath = path.join(__dirname, DB_FILE);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err);
  } else {
    console.log(`✅ Connected to SQLite at ${dbPath}`);
    initializeSchema();
  }
});

function initializeSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.warn("⚠ schema.sql not found – skipping automatic schema init");
    return;
  }

  const sql = fs.readFileSync(schemaPath, "utf8");
  db.exec(sql, (err) => {
    if (err) console.error("❌ Error applying schema.sql:", err);
    else {
      console.log("✅ schema.sql applied (or already up to date)");
      seedSuperAdmin(); // ← seed platform owner account
    }
  });
}

/**
 * Seeds the HallGuardian platform-owner account on first startup.
 * Set SUPER_ADMIN_PASSWORD in your .env (or Render env vars) to change the password.
 * This is idempotent — if the account already exists it does nothing.
 */
async function seedSuperAdmin() {
  const SUPER_EMAIL = process.env.SUPER_ADMIN_EMAIL || "team@hallguardian.com";
  const SUPER_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "HallGuardian@2024!";

  try {
    // Check if already seeded
    const existing = await get(
      "SELECT id FROM users WHERE email = ?",
      [SUPER_EMAIL]
    );

    if (existing) {
      console.log(`✅ Super admin account already exists: ${SUPER_EMAIL}`);
      return;
    }

    // Hash the password and insert
    const hash = await bcrypt.hash(SUPER_PASSWORD, SALT_ROUNDS);
    await run(
      `INSERT INTO users (full_name, email, password_hash, role, school_id, district_id, is_active, email_verified)
       VALUES (?, ?, ?, 'SUPER_ADMIN', NULL, NULL, 1, 1)`,
      ["HallGuardian Team", SUPER_EMAIL, hash]
    );

    console.log(`🔐 Super admin seeded → ${SUPER_EMAIL}`);
    console.log(`   Password: ${SUPER_PASSWORD}  ← change this in .env (SUPER_ADMIN_PASSWORD)`);
  } catch (err) {
    console.error("❌ Failed to seed super admin:", err.message);
  }
}

/* Promisified helpers */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Express setup                                                              */
/* -------------------------------------------------------------------------- */
const app = express();
app.use(express.json());

/* -------------------------------------------------------------------------- */
/* CORS (ONE place, BEFORE routes)                                            */
/* -------------------------------------------------------------------------- */
const allowedOrigins = [
  "https://hallguardian.com",
  "https://www.hallguardian.com",

  // Local web dev (Vite uses 5173 by default, but may fall back to 3000/3001)
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:19006"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, health checks, etc.)
      if (!origin) return callback(null, true);

      // Allow known web origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Optional Expo dev origins (tunnel/LAN)
      if (
        origin.startsWith("exp://") ||
        origin.startsWith("expo://") ||
        origin.includes(".exp.direct") ||
        origin.includes(".expo.dev")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Preflight
app.options("*", cors());

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* -------------------------------------------------------------------------- */
/* Test helper (disabled in production)                                       */
/* -------------------------------------------------------------------------- */
// POST /api/test/school — inserts a minimal school row so tests can satisfy
// the FK constraint on students.school_id and locations.school_id.
// Only available when NODE_ENV !== "production".
if (process.env.NODE_ENV !== "production") {
  app.post("/api/test/school", async (req, res) => {
    try {
      const { name, short_code } = req.body;
      if (!name || !short_code) {
        return res.status(400).json({ error: "name and short_code are required" });
      }
      const result = await run(
        `INSERT INTO schools (name, short_code, plan) VALUES (?, ?, 'FREE')`,
        [name, short_code]
      );
      const school = await get("SELECT * FROM schools WHERE id = ?", [result.id]);
      res.json({ success: true, school });
    } catch (err) {
      console.error("test/school error", err);
      res.status(500).json({ error: "Internal server error", detail: err.message });
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Auth middleware                                                            */
/* -------------------------------------------------------------------------- */
function authRequired(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid auth token" });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // SUPER_ADMIN bypasses all role restrictions
      const isSuperAdmin = payload.role === "SUPER_ADMIN";
      if (roles.length && !isSuperAdmin && !roles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload; // { userId, role, schoolId }
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Auth routes                                                                */
/* -------------------------------------------------------------------------- */

// Register (create initial admin/teacher users)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, role, schoolId, fullName } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "email, password, and role are required" });
    }

    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Derive a display name from email if not provided
    const displayName = (fullName || "").trim() || email.split("@")[0];

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await run(
      `INSERT INTO users (full_name, email, password_hash, role, school_id)
       VALUES (?, ?, ?, ?, ?)`,
      [displayName, email, hash, role, schoolId || null]
    );

    res.json({ success: true, userId: result.id });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login (returns JWT)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.school_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        schoolId: user.school_id
      }
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* Admin: Students CRUD                                                       */
/* -------------------------------------------------------------------------- */
app.get("/api/students", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.query.schoolId;
    if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

    const rows = await all("SELECT * FROM students WHERE school_id = ?", [schoolId]);
    res.json(rows);
  } catch (err) {
    console.error("students list error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/students", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const { schoolId, school_id_no, full_name, grade, qr_value, card_uid } = req.body;

    if (!schoolId || !school_id_no || !full_name) {
      return res
        .status(400)
        .json({ error: "schoolId, school_id_no and full_name are required" });
    }

    const result = await run(
      `INSERT INTO students (school_id, school_id_no, full_name, grade, qr_value, card_uid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [schoolId, school_id_no, full_name, grade || null, qr_value || null, card_uid || null]
    );

    const student = await get("SELECT * FROM students WHERE id = ?", [result.id]);
    res.json({ success: true, student });
  } catch (err) {
    console.error("students create error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/students/:id", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const id = req.params.id;
    const { full_name, grade, qr_value, card_uid } = req.body;

    await run(
      `UPDATE students
       SET full_name = COALESCE(?, full_name),
           grade = COALESCE(?, grade),
           qr_value = COALESCE(?, qr_value),
           card_uid = COALESCE(?, card_uid)
       WHERE id = ?`,
      [full_name, grade, qr_value, card_uid, id]
    );

    const student = await get("SELECT * FROM students WHERE id = ?", [id]);
    res.json({ success: true, student });
  } catch (err) {
    console.error("students update error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/students/:id", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const id = req.params.id;
    await run("DELETE FROM students WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("students delete error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* Admin: Locations CRUD                                                      */
/* -------------------------------------------------------------------------- */
app.get("/api/locations", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.query.schoolId;
    if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

    const rows = await all("SELECT * FROM locations WHERE school_id = ?", [schoolId]);
    res.json(rows);
  } catch (err) {
    console.error("locations list error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/locations", authRequired(["ADMIN"]), async (req, res) => {
  try {
    const { schoolId, name, code, type } = req.body;

    if (!schoolId || !name || !code) {
      return res.status(400).json({ error: "schoolId, name and code are required" });
    }

    const result = await run(
      `INSERT INTO locations (school_id, name, code, type)
       VALUES (?, ?, ?, ?)`,
      [schoolId, name, code, type || null]
    );

    const location = await get("SELECT * FROM locations WHERE id = ?", [result.id]);
    res.json({ success: true, location });
  } catch (err) {
    console.error("locations create error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* Scan helpers                                                               */
/* -------------------------------------------------------------------------- */
async function findOrCreateLocationByCode(schoolId, locationCode) {
  let loc = await get(
    "SELECT * FROM locations WHERE school_id = ? AND code = ?",
    [schoolId, locationCode]
  );

  if (!loc) {
    const result = await run(
      `INSERT INTO locations (school_id, name, code, type)
       VALUES (?, ?, ?, ?)`,
      [schoolId, locationCode, locationCode, "OTHER"]
    );
    loc = await get("SELECT * FROM locations WHERE id = ?", [result.id]);
  }

  return loc;
}

async function getNextDirection(studentId) {
  const last = await get(
    `SELECT direction FROM scan_events
     WHERE student_id = ?
     ORDER BY scanned_at DESC, id DESC
     LIMIT 1`,
    [studentId]
  );

  if (!last) return "IN";
  return last.direction === "IN" ? "OUT" : "IN";
}

/* -------------------------------------------------------------------------- */
/* Scan: QR + NFC                                                             */
/* -------------------------------------------------------------------------- */
app.post("/api/scan/qr", authRequired(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const { qrValue, locationCode, schoolId, deviceLabel } = req.body;

    if (!qrValue || !locationCode || !schoolId) {
      return res
        .status(400)
        .json({ error: "qrValue, locationCode, and schoolId are required" });
    }

    const student = await get(
      "SELECT * FROM students WHERE qr_value = ? AND school_id = ?",
      [qrValue, schoolId]
    );
    if (!student) return res.status(404).json({ error: "Student not found for that QR" });

    const location = await findOrCreateLocationByCode(schoolId, locationCode);
    const direction = await getNextDirection(student.id);

    const result = await run(
      `INSERT INTO scan_events
       (student_id, location_id, direction, source, device_label, scanned_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [student.id, location.id, direction, "QR", deviceLabel || null]
    );

    res.json({
      success: true,
      eventId: result.id,
      student: { id: student.id, name: student.full_name, school_id: student.school_id },
      location: { id: location.id, name: location.name, code: location.code },
      direction,
      source: "QR"
    });
  } catch (err) {
    console.error("scan qr error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/scan/nfc", authRequired(["ADMIN", "TEACHER"]), async (req, res) => {
  try {
    const { cardUid, locationCode, schoolId, deviceLabel } = req.body;

    if (!cardUid || !locationCode || !schoolId) {
      return res
        .status(400)
        .json({ error: "cardUid, locationCode, and schoolId are required" });
    }

    const student = await get(
      "SELECT * FROM students WHERE card_uid = ? AND school_id = ?",
      [cardUid, schoolId]
    );
    if (!student) return res.status(404).json({ error: "Student not found for that card UID" });

    const location = await findOrCreateLocationByCode(schoolId, locationCode);
    const direction = await getNextDirection(student.id);

    const result = await run(
      `INSERT INTO scan_events
       (student_id, location_id, direction, source, device_label, scanned_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [student.id, location.id, direction, "NFC", deviceLabel || null]
    );

    res.json({
      success: true,
      eventId: result.id,
      student: { id: student.id, name: student.full_name, school_id: student.school_id },
      location: { id: location.id, name: location.name, code: location.code },
      direction,
      source: "NFC"
    });
  } catch (err) {
    console.error("scan nfc error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/* Student current location                                                   */
/* -------------------------------------------------------------------------- */
app.get(
  "/api/students/:id/current-location",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const studentId = req.params.id;

      const event = await get(
        `SELECT se.*, l.name AS location_name, l.code AS location_code
         FROM scan_events se
         JOIN locations l ON l.id = se.location_id
         WHERE se.student_id = ?
         ORDER BY se.scanned_at DESC
         LIMIT 1`,
        [studentId]
      );

      if (!event) {
        return res.json({
          studentId,
          status: "NO_SCANS",
          currentLocation: null,
          lastScanAt: null
        });
      }

      res.json({
        studentId,
        status: event.direction === "IN" ? "IN_LOCATION" : "OUT_OF_LOCATION",
        currentLocation:
          event.direction === "IN"
            ? { id: event.location_id, name: event.location_name, code: event.location_code }
            : null,
        lastScanAt: event.scanned_at
      });
    } catch (err) {
      console.error("current-location error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Location occupants                                                         */
/* -------------------------------------------------------------------------- */
app.get(
  "/api/locations/:id/occupants",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const locationId = req.params.id;

      const rows = await all(
        `
        WITH last_scans AS (
          SELECT student_id, MAX(scanned_at) AS last_time
          FROM scan_events
          GROUP BY student_id
        )
        SELECT
          s.id AS student_id,
          s.full_name,
          se.direction,
          se.scanned_at
        FROM last_scans ls
        JOIN scan_events se
          ON se.student_id = ls.student_id
         AND se.scanned_at = ls.last_time
        JOIN students s ON s.id = se.student_id
        WHERE se.location_id = ?
          AND se.direction = 'IN'
        ORDER BY se.scanned_at DESC
        `,
        [locationId]
      );

      res.json({ locationId, count: rows.length, occupants: rows });
    } catch (err) {
      console.error("occupants error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* School: students currently OUT                                             */
/* -------------------------------------------------------------------------- */
app.get(
  "/api/schools/:id/current-out",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const schoolId = req.params.id;

      const rows = await all(
        `
        WITH last_scans AS (
          SELECT se.student_id, MAX(se.scanned_at) AS last_time
          FROM scan_events se
          JOIN students s ON s.id = se.student_id
          WHERE s.school_id = ?
          GROUP BY se.student_id
        )
        SELECT
          s.id AS student_id,
          s.full_name,
          l.name AS location_name,
          l.code AS location_code,
          se.direction,
          se.scanned_at
        FROM last_scans ls
        JOIN scan_events se
          ON se.student_id = ls.student_id
         AND se.scanned_at = ls.last_time
        JOIN students s ON s.id = se.student_id
        JOIN locations l ON l.id = se.location_id
        WHERE se.direction = 'OUT'
        ORDER BY se.scanned_at DESC
        `,
        [schoolId]
      );

      res.json({ schoolId, count: rows.length, outOfClass: rows });
    } catch (err) {
      console.error("current-out error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Pass History: completed hall passes with duration                          */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/schools/:id/pass-history
 * Returns completed hall passes (OUT → next IN pairs) for the school with
 * duration_seconds computed. Passes that are still open (student still OUT)
 * are included with duration_seconds = null and status = "ACTIVE".
 * Query params: limit (default 100), offset (default 0)
 */
app.get(
  "/api/schools/:id/pass-history",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const schoolId = req.params.id;
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      const offset = Number(req.query.offset) || 0;

      /* For each OUT scan find the next IN scan for the same student
         (the one that immediately follows it by id).  If there is no
         following IN scan the pass is still active. */
      const rows = await all(
        `
        SELECT
          out_evt.id          AS pass_id,
          s.id                AS student_id,
          s.full_name,
          s.grade,
          l.id                AS location_id,
          l.name              AS location_name,
          l.code              AS location_code,
          out_evt.scanned_at  AS out_at,
          in_evt.scanned_at   AS in_at,
          CASE
            WHEN in_evt.scanned_at IS NOT NULL
            THEN CAST(
              (julianday(in_evt.scanned_at) - julianday(out_evt.scanned_at))
              * 86400 AS INTEGER)
            ELSE NULL
          END AS duration_seconds,
          CASE WHEN in_evt.id IS NULL THEN 'ACTIVE' ELSE 'COMPLETED' END AS status,
          out_evt.source      AS scan_source
        FROM scan_events out_evt
        JOIN students s   ON s.id  = out_evt.student_id
        JOIN locations l  ON l.id  = out_evt.location_id
        LEFT JOIN scan_events in_evt
          ON in_evt.student_id = out_evt.student_id
         AND in_evt.direction  = 'IN'
         AND in_evt.id = (
               SELECT MIN(id) FROM scan_events
               WHERE student_id = out_evt.student_id
                 AND direction  = 'IN'
                 AND id > out_evt.id
             )
        WHERE out_evt.direction = 'OUT'
          AND s.school_id = ?
        ORDER BY out_evt.id DESC
        LIMIT ? OFFSET ?
        `,
        [schoolId, limit, offset]
      );

      // Total count (for pagination)
      const total = await get(
        `SELECT COUNT(*) AS cnt
         FROM scan_events se
         JOIN students s ON s.id = se.student_id
         WHERE se.direction = 'OUT' AND s.school_id = ?`,
        [schoolId]
      );

      res.json({ schoolId, total: total.cnt, limit, offset, passes: rows });
    } catch (err) {
      console.error("pass-history error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/students/:id/pass-history
 * Returns all passes for a specific student with duration.
 */
app.get(
  "/api/students/:id/pass-history",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const studentId = req.params.id;

      const rows = await all(
        `
        SELECT
          out_evt.id          AS pass_id,
          l.name              AS location_name,
          l.code              AS location_code,
          out_evt.scanned_at  AS out_at,
          in_evt.scanned_at   AS in_at,
          CASE
            WHEN in_evt.scanned_at IS NOT NULL
            THEN CAST(
              (julianday(in_evt.scanned_at) - julianday(out_evt.scanned_at))
              * 86400 AS INTEGER)
            ELSE NULL
          END AS duration_seconds,
          CASE WHEN in_evt.id IS NULL THEN 'ACTIVE' ELSE 'COMPLETED' END AS status
        FROM scan_events out_evt
        JOIN locations l ON l.id = out_evt.location_id
        LEFT JOIN scan_events in_evt
          ON in_evt.student_id = out_evt.student_id
         AND in_evt.direction  = 'IN'
         AND in_evt.id = (
               SELECT MIN(id) FROM scan_events
               WHERE student_id = out_evt.student_id
                 AND direction  = 'IN'
                 AND id > out_evt.id
             )
        WHERE out_evt.direction  = 'OUT'
          AND out_evt.student_id = ?
        ORDER BY out_evt.id DESC
        `,
        [studentId]
      );

      res.json({ studentId, passes: rows });
    } catch (err) {
      console.error("student pass-history error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Student Roster with live status                                            */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/schools/:id/roster
 * Returns full student list for a school, each annotated with their live
 * status (IN_CLASS | OUT | NO_SCANS) and, if OUT, how long they've been gone.
 */
app.get(
  "/api/schools/:id/roster",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const schoolId = req.params.id;

      const rows = await all(
        `
        SELECT
          s.id,
          s.full_name,
          s.grade,
          s.school_id_no,
          s.qr_value,
          s.card_uid,
          se.direction        AS last_direction,
          se.scanned_at       AS last_scan_at,
          l.name              AS last_location_name,
          l.code              AS last_location_code
        FROM students s
        LEFT JOIN (
          SELECT se2.*
          FROM scan_events se2
          INNER JOIN (
            SELECT student_id, MAX(scanned_at) AS max_at
            FROM scan_events GROUP BY student_id
          ) latest ON se2.student_id = latest.student_id
                   AND se2.scanned_at = latest.max_at
          GROUP BY se2.student_id  -- pick highest id if timestamps tie
          HAVING se2.id = MAX(se2.id)
        ) se ON se.student_id = s.id
        LEFT JOIN locations l ON l.id = se.location_id
        WHERE s.school_id = ?
          AND s.is_active  = 1
        ORDER BY s.full_name ASC
        `,
        [schoolId]
      );

      const students = rows.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        grade: r.grade,
        school_id_no: r.school_id_no,
        qr_value: r.qr_value,
        card_uid: r.card_uid,
        status: !r.last_direction
          ? "NO_SCANS"
          : r.last_direction === "OUT"
            ? "OUT"
            : "IN_CLASS",
        last_scan_at: r.last_scan_at,
        last_location: r.last_location_name
          ? { name: r.last_location_name, code: r.last_location_code }
          : null,
      }));

      res.json({ schoolId, count: students.length, students });
    } catch (err) {
      console.error("roster error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Manual recall: mark a student as returned (admin-injected IN scan)        */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/students/:id/recall
 * Inserts a manual IN scan for a student so the dashboard reflects they are
 * back in class, even if their QR/NFC was not scanned on the way back.
 */
app.post(
  "/api/students/:id/recall",
  authRequired(["ADMIN", "TEACHER"]),
  async (req, res) => {
    try {
      const studentId = req.params.id;

      // Confirm student exists
      const student = await get("SELECT * FROM students WHERE id = ?", [studentId]);
      if (!student) return res.status(404).json({ error: "Student not found" });

      // Find their current location from last OUT scan
      const lastOut = await get(
        `SELECT * FROM scan_events
         WHERE student_id = ? AND direction = 'OUT'
         ORDER BY scanned_at DESC, id DESC LIMIT 1`,
        [studentId]
      );

      if (!lastOut) {
        return res.status(400).json({ error: "Student has no active OUT pass to recall" });
      }

      // Check they haven't already returned
      const direction = await get(
        `SELECT direction FROM scan_events
         WHERE student_id = ?
         ORDER BY scanned_at DESC, id DESC LIMIT 1`,
        [studentId]
      );
      if (direction && direction.direction === "IN") {
        return res.status(400).json({ error: "Student is already marked as returned" });
      }

      // Insert manual IN scan at the same location
      const result = await run(
        `INSERT INTO scan_events
         (student_id, location_id, direction, source, notes, scanned_at)
         VALUES (?, ?, 'IN', 'MANUAL', 'Recalled by admin', CURRENT_TIMESTAMP)`,
        [studentId, lastOut.location_id]
      );

      res.json({
        success: true,
        eventId: result.id,
        student: { id: student.id, name: student.full_name },
        message: "Student marked as returned to class"
      });
    } catch (err) {
      console.error("recall error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Start server                                                               */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 HallGuardian backend running on port ${PORT}`);
});
