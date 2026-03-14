-- RLS policies for camping_settings table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Allow anyone (including unauthenticated booking flow) to READ settings
CREATE POLICY "camping_settings_select_all"
  ON camping_settings
  FOR SELECT
  USING (true);

-- 2. Allow users with admin role to UPDATE settings
CREATE POLICY "camping_settings_update_admin"
  ON camping_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- 3. Allow users with admin role to INSERT settings (first-time setup)
CREATE POLICY "camping_settings_insert_admin"
  ON camping_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
