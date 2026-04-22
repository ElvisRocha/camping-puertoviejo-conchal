-- WhatsApp broadcast opt-outs
-- Populated by Cori when a client replies STOP / BAJA / NO.
-- Queried by the Broadcast Estados n8n workflow to exclude recipients.

CREATE TABLE IF NOT EXISTS public.whatsapp_opt_outs (
  phone_number TEXT PRIMARY KEY,
  push_name TEXT,
  opted_out_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  keyword TEXT
);

ALTER TABLE public.whatsapp_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_opt_outs_all_access" ON public.whatsapp_opt_outs
  FOR ALL
  USING (true)
  WITH CHECK (true);
