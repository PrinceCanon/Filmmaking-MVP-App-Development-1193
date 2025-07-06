-- Add script column to projects table
ALTER TABLE projects_fc2024 
ADD COLUMN IF NOT EXISTS script TEXT DEFAULT '';

-- Add index for script searching if needed
CREATE INDEX IF NOT EXISTS idx_projects_script_search 
ON projects_fc2024 USING gin(to_tsvector('english', script))
WHERE script IS NOT NULL AND script != '';

-- Update any existing projects to have empty script if null
UPDATE projects_fc2024 
SET script = '' 
WHERE script IS NULL;