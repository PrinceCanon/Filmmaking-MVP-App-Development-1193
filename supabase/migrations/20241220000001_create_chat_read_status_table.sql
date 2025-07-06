-- Create chat read status table for tracking unread messages
CREATE TABLE IF NOT EXISTS chat_read_status_fc2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  last_read_message_id UUID,
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE chat_read_status_fc2024 ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own read status" ON chat_read_status_fc2024
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_read_status_project_user 
  ON chat_read_status_fc2024(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_chat_read_status_updated_at 
  ON chat_read_status_fc2024(updated_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_read_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_chat_read_status_updated_at
  BEFORE UPDATE ON chat_read_status_fc2024
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_read_status_updated_at();

-- Add message_type column to existing comments table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_comments_fc2024' AND column_name = 'message_type') THEN
    ALTER TABLE project_comments_fc2024 ADD COLUMN message_type TEXT DEFAULT 'general';
  END IF;
END $$;

-- Create index for message searching
CREATE INDEX IF NOT EXISTS idx_project_comments_content_search 
  ON project_comments_fc2024 USING gin(to_tsvector('english', content));

-- Create index for message type filtering
CREATE INDEX IF NOT EXISTS idx_project_comments_message_type 
  ON project_comments_fc2024(message_type);