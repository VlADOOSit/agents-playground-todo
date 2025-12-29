ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS deadline timestamptz NULL;
