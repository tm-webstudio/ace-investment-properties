-- Create property_documents table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('gas_safety', 'epc', 'electrical_safety', 'insurance_policy', 'hmo_license')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  expiry_date DATE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX idx_property_documents_landlord_id ON property_documents(landlord_id);
CREATE INDEX idx_property_documents_status ON property_documents(status);

-- Enable Row Level Security
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Landlords can view their own documents
CREATE POLICY "Landlords can view own documents" ON property_documents
  FOR SELECT USING (
    auth.uid() = landlord_id
  );

-- Landlords can insert their own documents
CREATE POLICY "Landlords can insert own documents" ON property_documents
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id
  );

-- Landlords can update their own documents
CREATE POLICY "Landlords can update own documents" ON property_documents
  FOR UPDATE USING (
    auth.uid() = landlord_id
  );

-- Landlords can delete their own documents
CREATE POLICY "Landlords can delete own documents" ON property_documents
  FOR DELETE USING (
    auth.uid() = landlord_id
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON property_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admins can update all documents (for approval/rejection)
CREATE POLICY "Admins can update all documents" ON property_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE property_documents IS 'Stores property-related documents like certificates and licenses';
COMMENT ON COLUMN property_documents.document_type IS 'Type of document: gas_safety, epc, electrical_safety, insurance_policy, hmo_license';
COMMENT ON COLUMN property_documents.status IS 'Document status: pending, approved, rejected';
