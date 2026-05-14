-- Supabase SQL Schema

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- matches Clerk user ID or whatever auth provider ID
  email TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY, -- From InvoiceData.id
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id::text = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id::text = auth.uid());

-- Policies for invoices
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (user_id::text = auth.uid());
CREATE POLICY "Users can insert own invoices" ON invoices FOR INSERT WITH CHECK (user_id::text = auth.uid());
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (user_id::text = auth.uid());
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (user_id::text = auth.uid());
