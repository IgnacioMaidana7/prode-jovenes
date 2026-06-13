-- Corrige ranking_global: exact_hits y winner_hits siempre devolvían 0
-- porque la definición original no contaba correctamente por puntos.
-- Exacto = 10 pts, Ganador = 5 pts (ver src/data/rules.ts)

CREATE OR REPLACE VIEW ranking_global AS
SELECT
  p.player_id,
  pr.username,
  pr.avatar_url,
  COALESCE(SUM(CASE WHEN f.status = 'FINISHED' THEN p.points ELSE 0 END), 0)::integer AS total_points,
  COUNT(CASE WHEN f.status = 'FINISHED' AND p.points >= 10 THEN 1 END)::integer        AS exact_hits,
  COUNT(CASE WHEN f.status = 'FINISHED' AND p.points > 0 AND p.points < 10 THEN 1 END)::integer AS winner_hits,
  COUNT(*)::integer                                             AS predictions_count,
  RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN f.status = 'FINISHED' THEN p.points ELSE 0 END), 0) DESC)::integer AS rank
FROM predictions p
JOIN profiles pr ON p.player_id = pr.id
JOIN fixtures f ON p.fixture_id = f.id
GROUP BY p.player_id, pr.username, pr.avatar_url;
