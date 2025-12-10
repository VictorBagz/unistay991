-- Create connection_requests table for roommate matching
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  sender_image TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(sender_id, recipient_id),
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient_id ON public.connection_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_id ON public.connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON public.connection_requests(status);

-- Update profiles table to add roommate_status column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS roommate_status VARCHAR(50) DEFAULT 'no-roommate' CHECK (roommate_status IN ('no-roommate', 'roomies', 'pending-request'));

-- Create index for roommate_status
CREATE INDEX IF NOT EXISTS idx_profiles_roommate_status ON public.profiles(roommate_status);

-- Enable RLS (Row Level Security) for connection_requests
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own sent requests" ON public.connection_requests;
CREATE POLICY "Users can view their own sent requests" ON public.connection_requests
  FOR SELECT USING (sender_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view their own received requests" ON public.connection_requests;
CREATE POLICY "Users can view their own received requests" ON public.connection_requests
  FOR SELECT USING (recipient_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can send connection requests" ON public.connection_requests;
CREATE POLICY "Users can send connection requests" ON public.connection_requests
  FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

DROP POLICY IF EXISTS "Recipients can update requests (accept/reject)" ON public.connection_requests;
CREATE POLICY "Recipients can update requests (accept/reject)" ON public.connection_requests
  FOR UPDATE USING (recipient_id = auth.uid()::text);

DROP POLICY IF EXISTS "Senders can delete their own requests" ON public.connection_requests;
CREATE POLICY "Senders can delete their own requests" ON public.connection_requests
  FOR DELETE USING (sender_id = auth.uid()::text);
