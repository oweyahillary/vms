-- Run this in Supabase SQL Editor to create all tables

CREATE TABLE IF NOT EXISTS admins (
    id         SERIAL PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitors (
    id         SERIAL PRIMARY KEY,
    full_name  TEXT NOT NULL,
    phone      TEXT,
    id_number  TEXT,
    email      TEXT,
    company    TEXT,
    vehicle    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id            SERIAL PRIMARY KEY,
    visitor_id    INT REFERENCES visitors(id),
    visit_type    TEXT,
    purpose       TEXT,
    host_name     TEXT,
    host_dept     TEXT,
    host_phone    TEXT,
    photo_url     TEXT,
    signature_url TEXT,
    check_in      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(check_in);
