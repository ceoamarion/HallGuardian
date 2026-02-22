// migrate.js — safely migrates hallguardian.db to the full schema
// Uses CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN for new columns on existing tables.
import sqlite3pkg from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3 = sqlite3pkg.verbose();
const db = new sqlite3.Database(
  path.join(__dirname, "hallguardian.db"),
  (err) => {
    if (err) { console.error("❌ Could not open DB:", err); process.exit(1); }
    console.log("✅ Opened hallguardian.db");
    run();
  }
);

function exec(sql) {
  return new Promise((res, rej) =>
    db.exec(sql, (e) => (e ? rej(e) : res()))
  );
}

function dbRun(sql, params = []) {
  return new Promise((res, rej) =>
    db.run(sql, params, function (e) { e ? rej(e) : res(this); })
  );
}

function all(sql, params = []) {
  return new Promise((res, rej) =>
    db.all(sql, params, (e, rows) => (e ? rej(e) : res(rows)))
  );
}

async function columnExists(table, column) {
  const rows = await all(`PRAGMA table_info(${table})`, []);
  return rows.some((r) => r.name === column);
}

async function addColumnIfMissing(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await dbRun(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ➕ Added column ${table}.${column}`);
  }
}

async function run() {
  try {
    // ── Pragmas ──────────────────────────────────────────────────────────────
    await exec(`PRAGMA foreign_keys = ON;`);
    await exec(`PRAGMA journal_mode  = WAL;`);
    await exec(`PRAGMA synchronous   = NORMAL;`);

    // ── 1. DISTRICTS (new table) ──────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS districts (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        state         TEXT,
        country       TEXT    NOT NULL DEFAULT 'US',
        contact_name  TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        is_active     INTEGER NOT NULL DEFAULT 1,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ districts table ready");

    // ── 2. SCHOOLS — add new columns ──────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS schools (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        district_id      INTEGER,
        name             TEXT    NOT NULL,
        short_code       TEXT    NOT NULL UNIQUE,
        address_line1    TEXT,
        address_line2    TEXT,
        city             TEXT,
        state            TEXT,
        zip              TEXT,
        country          TEXT    NOT NULL DEFAULT 'US',
        phone            TEXT,
        website          TEXT,
        admin_name       TEXT,
        admin_email      TEXT,
        admin_phone      TEXT,
        plan             TEXT    NOT NULL DEFAULT 'FREE'
                                 CHECK (plan IN ('FREE','STARTER','PRO','ENTERPRISE')),
        plan_expires_at  DATETIME,
        stripe_customer_id TEXT,
        stripe_sub_id    TEXT,
        is_active        INTEGER NOT NULL DEFAULT 1,
        signup_completed INTEGER NOT NULL DEFAULT 0,
        signup_token     TEXT    UNIQUE,
        timezone         TEXT    NOT NULL DEFAULT 'America/New_York',
        logo_url         TEXT,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
      );
    `);
    // Add any columns that may be missing on the pre-existing schools table
    const schoolCols = {
      district_id: "INTEGER",
      address_line1: "TEXT",
      address_line2: "TEXT",
      city: "TEXT",
      state: "TEXT",
      zip: "TEXT",
      country: "TEXT DEFAULT 'US'",
      phone: "TEXT",
      website: "TEXT",
      admin_name: "TEXT",
      admin_email: "TEXT",
      admin_phone: "TEXT",
      plan: "TEXT DEFAULT 'FREE'",
      plan_expires_at: "DATETIME",
      stripe_customer_id: "TEXT",
      stripe_sub_id: "TEXT",
      signup_completed: "INTEGER DEFAULT 0",
      signup_token: "TEXT",
      timezone: "TEXT DEFAULT 'America/New_York'",
      logo_url: "TEXT",
      updated_at: "DATETIME",
    };
    for (const [col, def] of Object.entries(schoolCols)) {
      await addColumnIfMissing("schools", col, def);
    }
    console.log("✅ schools table ready");

    // ── 3. USERS ──────────────────────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        district_id          INTEGER,
        school_id            INTEGER,
        full_name            TEXT    NOT NULL DEFAULT '',
        email                TEXT    NOT NULL UNIQUE,
        password_hash        TEXT    NOT NULL,
        role                 TEXT    NOT NULL CHECK (role IN (
                                 'SUPER_ADMIN','DISTRICT_ADMIN',
                                 'SCHOOL_ADMIN','TEACHER','STAFF'
                             )),
        phone                TEXT,
        avatar_url           TEXT,
        title                TEXT,
        is_active            INTEGER NOT NULL DEFAULT 1,
        email_verified       INTEGER NOT NULL DEFAULT 0,
        email_verify_token   TEXT,
        password_reset_token TEXT,
        password_reset_expires DATETIME,
        last_login_at        DATETIME,
        failed_login_count   INTEGER NOT NULL DEFAULT 0,
        locked_until         DATETIME,
        totp_secret          TEXT,
        totp_enabled         INTEGER NOT NULL DEFAULT 0,
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
        FOREIGN KEY (school_id)   REFERENCES schools(id)   ON DELETE SET NULL
      );
    `);
    const userCols = {
      district_id: "INTEGER",
      full_name: "TEXT DEFAULT ''",
      phone: "TEXT",
      avatar_url: "TEXT",
      title: "TEXT",
      is_active: "INTEGER DEFAULT 1",
      email_verified: "INTEGER DEFAULT 0",
      email_verify_token: "TEXT",
      password_reset_token: "TEXT",
      password_reset_expires: "DATETIME",
      last_login_at: "DATETIME",
      failed_login_count: "INTEGER DEFAULT 0",
      locked_until: "DATETIME",
      totp_secret: "TEXT",
      totp_enabled: "INTEGER DEFAULT 0",
      updated_at: "DATETIME",
    };
    for (const [col, def] of Object.entries(userCols)) {
      await addColumnIfMissing("users", col, def);
    }
    console.log("✅ users table ready");

    // ── 4. USER SESSIONS (new table) ─────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL,
        token_hash   TEXT    NOT NULL UNIQUE,
        device_info  TEXT,
        ip_address   TEXT,
        expires_at   DATETIME NOT NULL,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ user_sessions table ready");

    // ── 5. LOCATIONS ──────────────────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id   INTEGER NOT NULL,
        name        TEXT    NOT NULL,
        code        TEXT    NOT NULL,
        type        TEXT    NOT NULL DEFAULT 'CLASSROOM'
                            CHECK (type IN (
                                'CLASSROOM','BATHROOM','CAFETERIA',
                                'GYM','LIBRARY','OFFICE','HALLWAY','OTHER'
                            )),
        floor       TEXT,
        building    TEXT,
        capacity    INTEGER,
        is_active   INTEGER NOT NULL DEFAULT 1,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (school_id, code),
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);
    const locCols = {
      floor: "TEXT",
      building: "TEXT",
      capacity: "INTEGER",
      updated_at: "DATETIME",
    };
    for (const [col, def] of Object.entries(locCols)) {
      await addColumnIfMissing("locations", col, def);
    }
    console.log("✅ locations table ready");

    // ── 6. STUDENTS ───────────────────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS students (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id      INTEGER NOT NULL,
        school_id_no   TEXT    NOT NULL,
        full_name      TEXT    NOT NULL,
        preferred_name TEXT,
        grade          TEXT,
        homeroom       TEXT,
        date_of_birth  DATE,
        photo_url      TEXT,
        qr_value       TEXT    UNIQUE,
        card_uid       TEXT    UNIQUE,
        is_active      INTEGER NOT NULL DEFAULT 1,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (school_id, school_id_no),
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);
    const stuCols = {
      preferred_name: "TEXT",
      homeroom: "TEXT",
      date_of_birth: "DATE",
      photo_url: "TEXT",
      updated_at: "DATETIME",
    };
    for (const [col, def] of Object.entries(stuCols)) {
      await addColumnIfMissing("students", col, def);
    }
    console.log("✅ students table ready");

    // ── 7. PASS RULES (new table) ─────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS pass_rules (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id             INTEGER NOT NULL,
        location_id           INTEGER,
        max_concurrent_passes INTEGER,
        max_duration_minutes  INTEGER,
        blocked_start_time    TEXT,
        blocked_end_time      TEXT,
        notes                 TEXT,
        is_active             INTEGER NOT NULL DEFAULT 1,
        created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id)   REFERENCES schools(id)   ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ pass_rules table ready");

    // ── 8. SCAN EVENTS ────────────────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS scan_events (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id   INTEGER NOT NULL,
        location_id  INTEGER NOT NULL,
        scanned_by   INTEGER,
        direction    TEXT    NOT NULL CHECK (direction IN ('IN','OUT')),
        source       TEXT    NOT NULL DEFAULT 'QR'
                             CHECK (source IN ('QR','NFC','MANUAL','IMPORT')),
        device_label TEXT,
        notes        TEXT,
        scanned_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
        FOREIGN KEY (scanned_by)  REFERENCES users(id)     ON DELETE SET NULL
      );
    `);
    await addColumnIfMissing("scan_events", "scanned_by", "INTEGER");
    await addColumnIfMissing("scan_events", "notes", "TEXT");
    console.log("✅ scan_events table ready");

    // ── 9. DEVICES (new table) ────────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS devices (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id    INTEGER NOT NULL,
        location_id  INTEGER,
        label        TEXT    NOT NULL,
        device_token TEXT    NOT NULL UNIQUE,
        platform     TEXT    CHECK (platform IN ('IOS','ANDROID','WEB','OTHER')),
        model        TEXT,
        last_seen_at DATETIME,
        is_active    INTEGER NOT NULL DEFAULT 1,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id)   REFERENCES schools(id)   ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ devices table ready");

    // ── 10. SUBSCRIPTION EVENTS (new table) ──────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS subscription_events (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id       INTEGER NOT NULL,
        event_type      TEXT    NOT NULL CHECK (event_type IN (
                            'TRIAL_START','TRIAL_END',
                            'SUBSCRIBED','UPGRADED','DOWNGRADED',
                            'RENEWED','CANCELLED','PAYMENT_FAILED','REFUNDED'
                        )),
        from_plan       TEXT,
        to_plan         TEXT,
        amount_cents    INTEGER,
        currency        TEXT    DEFAULT 'USD',
        stripe_event_id TEXT    UNIQUE,
        notes           TEXT,
        occurred_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ subscription_events table ready");

    // ── 11. AUDIT LOG (new table) ─────────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id     INTEGER,
        school_id    INTEGER,
        action       TEXT    NOT NULL,
        target_type  TEXT,
        target_id    INTEGER,
        old_values   TEXT,
        new_values   TEXT,
        ip_address   TEXT,
        user_agent   TEXT,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (actor_id)  REFERENCES users(id)   ON DELETE SET NULL,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ audit_log table ready");

    // ── 12. NOTIFICATIONS (new table) ────────────────────────────────────
    await exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id    INTEGER NOT NULL,
        user_id      INTEGER,
        type         TEXT    NOT NULL CHECK (type IN (
                         'STUDENT_OVERTIME','CAPACITY_EXCEEDED','PASS_BLOCKED',
                         'ACCOUNT_EXPIRING','PAYMENT_FAILED','SYSTEM'
                     )),
        title        TEXT    NOT NULL,
        body         TEXT    NOT NULL,
        reference_id INTEGER,
        is_read      INTEGER NOT NULL DEFAULT 0,
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
      );
    `);
    console.log("✅ notifications table ready");

    // ── Indexes ───────────────────────────────────────────────────────────
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_schools_district        ON schools (district_id);",
      "CREATE INDEX IF NOT EXISTS idx_schools_plan            ON schools (plan);",
      "CREATE INDEX IF NOT EXISTS idx_users_email             ON users (email);",
      "CREATE INDEX IF NOT EXISTS idx_users_school            ON users (school_id);",
      "CREATE INDEX IF NOT EXISTS idx_users_district          ON users (district_id);",
      "CREATE INDEX IF NOT EXISTS idx_sessions_user           ON user_sessions (user_id);",
      "CREATE INDEX IF NOT EXISTS idx_sessions_expires        ON user_sessions (expires_at);",
      "CREATE INDEX IF NOT EXISTS idx_locations_school        ON locations (school_id);",
      "CREATE INDEX IF NOT EXISTS idx_students_school         ON students (school_id);",
      "CREATE INDEX IF NOT EXISTS idx_students_qr             ON students (qr_value);",
      "CREATE INDEX IF NOT EXISTS idx_students_card           ON students (card_uid);",
      "CREATE INDEX IF NOT EXISTS idx_scan_events_student     ON scan_events (student_id, scanned_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_scan_events_location    ON scan_events (location_id, scanned_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_scan_events_time        ON scan_events (scanned_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_scan_events_scanned_by  ON scan_events (scanned_by);",
      "CREATE INDEX IF NOT EXISTS idx_devices_school          ON devices (school_id);",
      "CREATE INDEX IF NOT EXISTS idx_sub_events_school       ON subscription_events (school_id, occurred_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_audit_school            ON audit_log (school_id, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_audit_actor             ON audit_log (actor_id, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_audit_target            ON audit_log (target_type, target_id);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_user      ON notifications (user_id, is_read, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_school    ON notifications (school_id, created_at DESC);",
    ];
    for (const idx of indexes) await exec(idx);
    console.log("✅ All indexes ready");

    // ── Triggers ──────────────────────────────────────────────────────────
    const triggers = [
      `CREATE TRIGGER IF NOT EXISTS trg_districts_updated_at AFTER UPDATE ON districts BEGIN UPDATE districts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;`,
      `CREATE TRIGGER IF NOT EXISTS trg_schools_updated_at   AFTER UPDATE ON schools   BEGIN UPDATE schools   SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;`,
      `CREATE TRIGGER IF NOT EXISTS trg_users_updated_at     AFTER UPDATE ON users     BEGIN UPDATE users     SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;`,
      `CREATE TRIGGER IF NOT EXISTS trg_locations_updated_at AFTER UPDATE ON locations BEGIN UPDATE locations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;`,
      `CREATE TRIGGER IF NOT EXISTS trg_students_updated_at  AFTER UPDATE ON students  BEGIN UPDATE students  SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;`,
    ];
    for (const t of triggers) await exec(t);
    console.log("✅ All triggers ready");

    // ── Summary ───────────────────────────────────────────────────────────
    const tables = await all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", []
    );
    console.log("\n🗄️  Tables in hallguardian.db:");
    tables.forEach((t) => console.log("   •", t.name));

    db.close();
    console.log("\n✅ Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    db.close();
    process.exit(1);
  }
}
