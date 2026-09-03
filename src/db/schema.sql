-- Personal Momentum OS SQLite Schema

PRAGMA foreign_keys = ON;

-- 1. Life Directions
CREATE TABLE IF NOT EXISTS life_directions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Areas
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    life_direction_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (life_direction_id) REFERENCES life_directions(id) ON DELETE CASCADE
);

-- 3. Priorities
CREATE TABLE IF NOT EXISTS priorities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    area_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    current_phase TEXT NOT NULL CHECK(current_phase IN ('SPARK', 'FIRE', 'COOK')),
    current_goal_id TEXT,
    spark_definition TEXT NOT NULL,
    fire_definition TEXT NOT NULL,
    cook_definition TEXT NOT NULL,
    synthesis_definition TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- 4. Goals (for sequential milestone progression)
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    priority_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    measurement_type TEXT NOT NULL CHECK(measurement_type IN ('COUNT', 'BOOLEAN', 'QUALITATIVE', 'MAINTENANCE')),
    unit TEXT,
    start_value REAL NOT NULL DEFAULT 0,
    target_value REAL NOT NULL DEFAULT 1,
    current_value REAL NOT NULL DEFAULT 0,
    target_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'ACHIEVED', 'RETIRED')),
    sequence_number INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    achieved_at TEXT,
    achievement_note TEXT,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE CASCADE
);

-- 5. Progress Events (Immutable event log)
CREATE TABLE IF NOT EXISTS progress_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    priority_id TEXT NOT NULL,
    goal_id TEXT,
    event_type TEXT NOT NULL CHECK(event_type IN ('SPARK', 'FIRE', 'COOK_SESSION', 'SYNTHESIS', 'SERVE', 'GOAL_ACHIEVED')),
    occurred_at TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'VOIDED')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
);

-- 6. Phase Transitions
CREATE TABLE IF NOT EXISTS phase_transitions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    priority_id TEXT NOT NULL,
    from_phase TEXT NOT NULL CHECK(from_phase IN ('SPARK', 'FIRE', 'COOK')),
    to_phase TEXT NOT NULL CHECK(to_phase IN ('SPARK', 'FIRE', 'COOK')),
    timestamp TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE CASCADE
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_areas_life_direction ON areas(life_direction_id);
CREATE INDEX IF NOT EXISTS idx_priorities_area ON priorities(area_id);
CREATE INDEX IF NOT EXISTS idx_priorities_user_active ON priorities(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority_id);
CREATE INDEX IF NOT EXISTS idx_events_priority ON progress_events(priority_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_user ON progress_events(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_priority ON phase_transitions(priority_id, timestamp);

