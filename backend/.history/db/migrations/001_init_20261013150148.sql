CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

CREATE TABLE patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  cin        TEXT NOT NULL UNIQUE,
  phone      TEXT NOT NULL,
  birth_date DATE NOT NULL,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT patients_birth_date_past CHECK (birth_date <= CURRENT_DATE)
);

CREATE INDEX idx_patients_full_name_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_patients_active ON patients (created_at DESC) WHERE deleted_at IS NULL;

-- Fixed 30-minute window. IMMUTABLE is safe because the interval has no days/months.
CREATE FUNCTION appointment_window(ts TIMESTAMPTZ) RETURNS tstzrange
LANGUAGE sql IMMUTABLE AS
$$ SELECT tstzrange(ts, ts + interval '30 minutes') $$;

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  created_by       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  reason           TEXT NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Business rule: no two confirmed appointments within 30 min for one patient
  CONSTRAINT appointments_no_confirmed_overlap
    EXCLUDE USING gist (
      patient_id WITH =,
      appointment_window(appointment_date) WITH &&
    ) WHERE (status = 'confirmed')
);

CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_status_date ON appointments (status, appointment_date);