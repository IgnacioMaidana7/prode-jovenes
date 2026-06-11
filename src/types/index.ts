/**
 * Tipos de dominio del Prode + tipado del schema de Supabase.
 *
 * Si más adelante generás los tipos automáticamente con
 *   `supabase gen types typescript --linked > src/types/database.types.ts`
 * podés reemplazar el bloque `Database` por el archivo generado y mantener
 * los tipos "de dominio" (Fixture, Prediction, etc.) como aliases finos.
 */

/* ─────────────────────────  Dominio  ───────────────────────── */

export type FixtureStage = "GROUP" | "R16" | "QF" | "SF" | "F" | "3RD";

export type FixtureStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export type GroupLetter = "A" | "B" | "C" | "D" | string;

export type Fixture = {
  id: string;
  external_id: number | null;
  stage: FixtureStage;
  group_name: GroupLetter | null;
  team_home: string | null;
  team_away: string | null;
  flag_home: string | null;
  flag_away: string | null;
  date: string;
  result_home: number | null;
  result_away: number | null;
  status: FixtureStatus;
};

export type Prediction = {
  id: string;
  player_id: string;
  fixture_id: string;
  pred_home: number;
  pred_away: number;
  points: number | null;
  created_at: string;
};

export type PredictionInsert = {
  player_id: string;
  fixture_id: string;
  pred_home: number;
  pred_away: number;
};

export type Profile = {
  id: string;
  username: string;
  dni: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
};

export type ProfileInsert = {
  id: string;
  username: string;
  dni?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
};

export type Group = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
};

export type GroupMember = {
  group_id: string;
  player_id: string;
};

/* ─────────────────  Vistas (rankings)  ───────────────── */

export type LeaderboardEntry = {
  player_id: string;
  username: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_hits: number;
  winner_hits: number;
  predictions_count: number;
  rank: number;
};

export type GroupLeaderboardEntry = LeaderboardEntry & {
  group_id: string;
};

/* ─────────────  Helpers de UI / estado local  ───────────── */

export type Player = {
  id: string;
  username: string;
  dni: string;
};

export type MatchKind = "group" | "knockout";

/* ─────────────────────  Database (Supabase)  ───────────────────── */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Profile>;
        Relationships: [];
      };
      fixtures: {
        Row: Fixture;
        Insert: Omit<Fixture, "id"> & { id?: string };
        Update: Partial<Fixture>;
        Relationships: [];
      };
      predictions: {
        Row: Prediction;
        Insert: PredictionInsert & {
          id?: string;
          points?: number | null;
          created_at?: string;
        };
        Update: Partial<Prediction>;
        Relationships: [];
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, "id"> & { id?: string };
        Update: Partial<Group>;
        Relationships: [];
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMember;
        Update: Partial<GroupMember>;
        Relationships: [];
      };
    };
    Views: {
      ranking_global: {
        Row: LeaderboardEntry;
        Relationships: [];
      };
      ranking_by_group: {
        Row: GroupLeaderboardEntry;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      fixture_stage: FixtureStage;
      fixture_status: FixtureStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
