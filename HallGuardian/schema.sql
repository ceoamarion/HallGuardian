-- =============================================================================
--  HallGuardian — Full Database Schema
--  SQLite (WAL mode recommended in production)
--  Auto-applied by server.js on startup via db.exec()
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode  = WAL;
PRAGMA synchronous   = NORMAL;

-- =============================================================================
-- 1. DISTRICTS
--    A district owns multiple schools. District admins can manage all
--    schools under them. A school can exist without a district (standalone).
-- =============================================================================
CREATE TABLE IF NOT EXISTS districts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    state        TEXT,                          -- e.g. "NY", "CA"
    country      TEXT    NOT NULL DEFAULT 'US',
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. SCHOOLS
--    Each school signs up independently or under a district.
--    Contains billing, contact, and subscription-tier info.
-- =============================================================================
CREATE TABLE IF NOT EXISTS schools (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id      INTEGER,                   -- NULL if standalone school
    name             TEXT    NOT NULL,
    short_code       TEXT    NOT NULL UNIQUE,   -- "WHS", "LMS" — used in QR prefixes
    address_line1    TEXT,
    address_line2    TEXT,
    city             TEXT,
    state            TEXT,
    zip              TEXT,
    country          TEXT    NOT NULL DEFAULT 'US',
    phone            TEXT,
    website          TEXT,

    -- Primary admin contact for the school
    admin_name       TEXT,
    admin_email      TEXT,
    admin_phone      TEXT,

    -- Subscription / billing
    plan             TEXT    NOT NULL DEFAULT 'FREE'
                             CHECK (plan IN ('FREE','STARTER','PRO','ENTERPRISE')),
    plan_expires_at  DATETIME,                  -- NULL = no expiry (e.g. FREE tier)
    stripe_customer_id TEXT,                   -- Stripe customer ID for billing
    stripe_sub_id    TEXT,                     -- Stripe subscription ID

    -- Status
    is_active        INTEGER NOT NULL DEFAULT 1,
    signup_completed INTEGER NOT NULL DEFAULT 0, -- 1 once onboarding wizard done
    signup_token     TEXT    UNIQUE,             -- emailed invite / verification token

    timezone         TEXT    NOT NULL DEFAULT 'America/New_York',
    logo_url         TEXT,

    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_schools_district
    ON schools (district_id);

CREATE INDEX IF NOT EXISTS idx_schools_plan
    ON schools (plan);

-- =============================================================================
-- 3. USERS
--    All humans who log in: platform super-admins, district admins,
--    school admins, and teachers/staff. Passwords stored as bcrypt hashes.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id        INTEGER,                -- set for district-level admins
    school_id          INTEGER,                -- set for school-level users (or NULL = global)

    full_name          TEXT    NOT NULL,
    email              TEXT    NOT NULL UNIQUE,
    password_hash      TEXT    NOT NULL,       -- bcrypt hash (never store plain text)

    role               TEXT    NOT NULL CHECK (role IN (
                           'SUPER_ADMIN',      -- platform owner, full access
                           'DISTRICT_ADMIN',   -- manages all schools in their district
                           'SCHOOL_ADMIN',     -- manages one school
                           'TEACHER',          -- scan + view own class
                           'STAFF'             -- scan-only (office staff, etc.)
                       )),

    -- Profile
    phone              TEXT,
    avatar_url         TEXT,
    title              TEXT,                   -- "Mr.", "Dr.", "Principal", etc.

    -- Auth / security
    is_active          INTEGER NOT NULL DEFAULT 1,
    email_verified     INTEGER NOT NULL DEFAULT 0,
    email_verify_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    last_login_at      DATETIME,
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until       DATETIME,               -- temporary lockout after failed attempts

    -- 2-factor (optional)
    totp_secret        TEXT,                   -- base32 TOTP secret if 2FA enabled
    totp_enabled       INTEGER NOT NULL DEFAULT 0,

    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id)   REFERENCES schools(id)   ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_school
    ON users (school_id);

CREATE INDEX IF NOT EXISTS idx_users_district
    ON users (district_id);

-- =============================================================================
-- 4. USER SESSIONS (optional — for server-side session tracking in addition to JWT)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    token_hash   TEXT    NOT NULL UNIQUE,       -- SHA-256 of the JWT/refresh token
    device_info  TEXT,                          -- "iPhone 14 / Safari"
    ip_address   TEXT,
    expires_at   DATETIME NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user
    ON user_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires
    ON user_sessions (expires_at);

-- =============================================================================
-- 5. LOCATIONS (classrooms, bathrooms, cafeteria, office, gym, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS locations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id   INTEGER NOT NULL,
    name        TEXT    NOT NULL,              -- "Room 101", "Main Bathroom"
    code        TEXT    NOT NULL,              -- "ROOM-101"  (used in QR payloads)
    type        TEXT    NOT NULL DEFAULT 'CLASSROOM'
                        CHECK (type IN (
                            'CLASSROOM','BATHROOM','CAFETERIA',
                            'GYM','LIBRARY','OFFICE','HALLWAY','OTHER'
                        )),
    floor       TEXT,                          -- "1st Floor", "2nd Floor"
    building    TEXT,                          -- for large campuses
    capacity    INTEGER,                       -- max simultaneous occupants (optional)
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (school_id, code),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_locations_school
    ON locations (school_id);

-- =============================================================================
-- 6. STUDENTS
--    One student belongs to one school. Each has a unique QR value and
--    optionally an NFC card UID.
-- =============================================================================
CREATE TABLE IF NOT EXISTS students (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id      INTEGER NOT NULL,
    school_id_no   TEXT    NOT NULL,           -- school's own student ID ("S-1001")
    full_name      TEXT    NOT NULL,
    preferred_name TEXT,                       -- nickname / goes-by name
    grade          TEXT,                       -- "9", "10", "11", "12", "K" etc.
    homeroom       TEXT,                       -- homeroom teacher or class label
    date_of_birth  DATE,
    photo_url      TEXT,                       -- optional student photo

    -- Credentials
    qr_value       TEXT    UNIQUE,             -- encoded string in the QR on their ID card
    card_uid       TEXT    UNIQUE,             -- NFC card UID (optional)

    -- Status
    is_active      INTEGER NOT NULL DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (school_id, school_id_no),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_students_school
    ON students (school_id);

CREATE INDEX IF NOT EXISTS idx_students_qr
    ON students (qr_value);

CREATE INDEX IF NOT EXISTS idx_students_card
    ON students (card_uid);

-- =============================================================================
-- 7. HALL PASS RULES
--    Per-school (or per-location) limits: max students out at once,
--    max minutes allowed, blocked time windows, etc.
-- =============================================================================
CREATE TABLE IF NOT EXISTS pass_rules (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id             INTEGER NOT NULL,
    location_id           INTEGER,             -- NULL = school-wide rule
    max_concurrent_passes INTEGER,             -- e.g. 2 students out at once
    max_duration_minutes  INTEGER,             -- alert if student exceeds this
    blocked_start_time    TEXT,               -- "08:00" — no passes during this window
    blocked_end_time      TEXT,               -- "08:30"
    notes                 TEXT,
    is_active             INTEGER NOT NULL DEFAULT 1,
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id)  REFERENCES schools(id)   ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- =============================================================================
-- 8. SCAN EVENTS (QR or NFC — the core movement log)
-- =============================================================================
CREATE TABLE IF NOT EXISTS scan_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id   INTEGER NOT NULL,
    location_id  INTEGER NOT NULL,
    scanned_by   INTEGER,                      -- user_id of scannng teacher/staff
    direction    TEXT    NOT NULL CHECK (direction IN ('IN','OUT')),
    source       TEXT    NOT NULL DEFAULT 'QR'
                         CHECK (source IN ('QR','NFC','MANUAL','IMPORT')),
    device_label TEXT,                         -- "Room 101 iPad"
    notes        TEXT,                         -- optional teacher note on this scan
    scanned_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by)  REFERENCES users(id)     ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_events_student
    ON scan_events (student_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_scan_events_location
    ON scan_events (location_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_scan_events_time
    ON scan_events (scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_scan_events_scanned_by
    ON scan_events (scanned_by);

-- =============================================================================
-- 9. DEVICES (tablets/phones registered to scan)
--    Tracks which physical devices are authorized for each school.
-- =============================================================================
CREATE TABLE IF NOT EXISTS devices (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id    INTEGER NOT NULL,
    location_id  INTEGER,                      -- assigned room (can change)
    label        TEXT    NOT NULL,             -- "Room 101 iPad"
    device_token TEXT    NOT NULL UNIQUE,      -- secret token this device uses to auth
    platform     TEXT    CHECK (platform IN ('IOS','ANDROID','WEB','OTHER')),
    model        TEXT,                         -- "iPad 9th Gen"
    last_seen_at DATETIME,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id)  REFERENCES schools(id)   ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_devices_school
    ON devices (school_id);

-- =============================================================================
-- 10. SUBSCRIPTIONS / PLAN HISTORY
--     Tracks every plan change, trial, upgrade, downgrade, and cancellation.
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscription_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id       INTEGER NOT NULL,
    event_type      TEXT    NOT NULL CHECK (event_type IN (
                        'TRIAL_START','TRIAL_END',
                        'SUBSCRIBED','UPGRADED','DOWNGRADED',
                        'RENEWED','CANCELLED','PAYMENT_FAILED',
                        'REFUNDED'
                    )),
    from_plan       TEXT,
    to_plan         TEXT,
    amount_cents    INTEGER,                   -- amount charged in cents (e.g. 4900 = $49.00)
    currency        TEXT    DEFAULT 'USD',
    stripe_event_id TEXT    UNIQUE,            -- dedup Stripe webhook events
    notes           TEXT,
    occurred_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sub_events_school
    ON subscription_events (school_id, occurred_at DESC);

-- =============================================================================
-- 11. AUDIT LOG
--     Immutable append-only log of all significant actions for compliance.
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id     INTEGER,                      -- user_id who did the action (NULL = system)
    school_id    INTEGER,
    action       TEXT    NOT NULL,             -- e.g. "STUDENT_CREATED", "USER_DELETED"
    target_type  TEXT,                         -- e.g. "student", "user", "location"
    target_id    INTEGER,                      -- ID of the affected row
    old_values   TEXT,                         -- JSON snapshot before change
    new_values   TEXT,                         -- JSON snapshot after change
    ip_address   TEXT,
    user_agent   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (actor_id)  REFERENCES users(id)   ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_school
    ON audit_log (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_actor
    ON audit_log (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_target
    ON audit_log (target_type, target_id);

-- =============================================================================
-- 12. NOTIFICATIONS / ALERTS
--     System-generated alerts: student out too long, capacity exceeded, etc.
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id    INTEGER NOT NULL,
    user_id      INTEGER,                      -- NULL = broadcast to all admins
    type         TEXT    NOT NULL CHECK (type IN (
                     'STUDENT_OVERTIME',        -- student has been out too long
                     'CAPACITY_EXCEEDED',       -- too many students at a location
                     'PASS_BLOCKED',            -- pass attempt during blocked window
                     'ACCOUNT_EXPIRING',        -- plan about to expire
                     'PAYMENT_FAILED',
                     'SYSTEM'
                 )),
    title        TEXT    NOT NULL,
    body         TEXT    NOT NULL,
    reference_id INTEGER,                      -- e.g. scan_event id that triggered it
    is_read      INTEGER NOT NULL DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_school
    ON notifications (school_id, created_at DESC);

-- =============================================================================
-- Triggers: keep updated_at fresh automatically
-- =============================================================================
CREATE TRIGGER IF NOT EXISTS trg_districts_updated_at
    AFTER UPDATE ON districts
    BEGIN UPDATE districts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_schools_updated_at
    AFTER UPDATE ON schools
    BEGIN UPDATE schools SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
    AFTER UPDATE ON users
    BEGIN UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_locations_updated_at
    AFTER UPDATE ON locations
    BEGIN UPDATE locations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_students_updated_at
    AFTER UPDATE ON students
    BEGIN UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
