-- Add deadline column to tasks table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks'
        AND column_name = 'deadline'
) THEN
ALTER TABLE tasks
ADD COLUMN deadline TIMESTAMPTZ;
END IF;
END $$;