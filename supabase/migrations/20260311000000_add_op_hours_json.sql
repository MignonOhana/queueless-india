-- Migration to add op_hours_json to businesses table
-- Supports complex schedules: multiple shifts, day-specific hours, etc.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS op_hours_json jsonb;

-- Default structure example (for reference/documentation):
-- {
--   "mon": [{"open": "09:00", "close": "17:00"}],
--   "tue": [{"open": "09:00", "close": "17:00"}],
--   ...
--   "sat": [{"open": "09:00", "close": "13:00"}],
--   "sun": null
-- }

COMMENT ON COLUMN businesses.op_hours_json IS 'Flexible business hours JSON. Keys are "mon", "tue", etc. Values are arrays of {open, close} objects or null if closed.';
