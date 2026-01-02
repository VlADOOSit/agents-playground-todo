-- Add deleted_at column for soft delete functionality
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks'
        AND column_name = 'deleted_at'
) THEN
ALTER TABLE tasks
ADD COLUMN deleted_at TIMESTAMPTZ;
END IF;
END $$;