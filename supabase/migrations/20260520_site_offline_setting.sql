-- Seed the site_offline flag in camping_settings.
-- When 'true', the public site shows an "unavailable" page; /admin and /auth
-- remain accessible. Toggle via the admin panel "Configuración" tab.
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

INSERT INTO camping_settings (key, value, updated_at)
VALUES ('site_offline', 'false', NOW())
ON CONFLICT (key) DO NOTHING;
