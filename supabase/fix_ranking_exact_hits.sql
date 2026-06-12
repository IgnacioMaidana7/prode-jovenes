-- Corrige ranking_global: exact_hits y winner_hits siempre devolvían 0
-- porque la definición original no contaba correctamente por puntos.
-- Exacto = 10 pts, Ganador = 5 pts (ver src/data/rules.ts)

CREATE OR REPLACE VIEW ranking_global AS
SELECT
  p.player_id,
  pr.username,
  pr.avatar_url,
  COALESCE(SUM(p.points), 0)::integer                          AS total_points,
  COUNT(CASE WHEN p.points >= 10 THEN 1 END)::integer          AS exact_hits,
  COUNT(CASE WHEN p.points > 0 AND p.points < 10 THEN 1 END)::integer AS winner_hits,
  COUNT(*)::integer                                             AS predictions_count,
  RANK() OVER (ORDER BY COALESCE(SUM(p.points), 0) DESC)::integer AS rank
FROM predictions p
JOIN profiles pr ON p.player_id = pr.id
GROUP BY p.player_id, pr.username, pr.avatar_url;
