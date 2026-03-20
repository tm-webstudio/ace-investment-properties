CREATE TABLE viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  investor_email TEXT NOT NULL,
  investor_phone TEXT NOT NULL,
  requested_date DATE NOT NULL,
  message TEXT,
  vapi_call_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unavailable', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON viewing_requests FOR SELECT
  USING (investor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Service role full access"
  ON viewing_requests FOR ALL
  USING (auth.role() = 'service_role');
