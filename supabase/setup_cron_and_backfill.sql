-- ═══════════════════════════════════════════════════════
-- 1. Recalcular puntos de predicciones ya existentes
--    (backfill para partidos que ya tienen resultado)
-- ═══════════════════════════════════════════════════════
UPDATE predictions p
SET points = CASE
  WHEN p.pred_home = f.result_home AND p.pred_away = f.result_away THEN 10
  WHEN sign(p.pred_home::float - p.pred_away::float)
     = sign(f.result_home::float - f.result_away::float) THEN 5
  ELSE 0
END
FROM fixtures f
WHERE p.fixture_id = f.id
  AND f.status = 'FINISHED'
  AND f.result_home IS NOT NULL
  AND f.result_away IS NOT NULL;


-- ═══════════════════════════════════════════════════════
-- 2. Cron: llamar al Edge Function cada 20 minutos
--    (72 req/día < límite de 100 de football-data.org)
--    Requiere habilitar pg_cron en Supabase:
--    Dashboard → Database → Extensions → pg_cron
-- ═══════════════════════════════════════════════════════

-- Primero eliminar el cron anterior si existe
SELECT cron.unschedule('sync-results')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-results'
);

-- Crear nuevo cron cada 20 minutos
-- Reemplazá <PROJECT_REF> con: ijztsbkcfrbxvprzsqkq
-- Reemplazá <ANON_KEY> con tu anon key del .env
SELECT cron.schedule(
  'sync-results',
  '*/20 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ijztsbkcfrbxvprzsqkq.supabase.co/functions/v1/sync-results',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqenRzYmtjZnJieHZwcnpzcWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjgzODMsImV4cCI6MjA5NjcwNDM4M30.-kR9prD9KdaOTpU83jCxN66g7lpX0xJ1YGkbzv7AuMk"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
