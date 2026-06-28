-- Migración: soporte para tiebreak en eliminatorias
-- Ejecutar en: Supabase > SQL Editor

-- 1. Predicciones: equipo elegido para pasar cuando se pronostica empate
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS tiebreak_winner TEXT;

-- 2. Fixtures: equipo que efectivamente pasó (por goles normales o penales)
ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS winner_code TEXT;
