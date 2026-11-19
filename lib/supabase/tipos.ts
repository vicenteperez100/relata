/**
 * Tipos de la base de datos, escritos a mano a partir de
 * supabase/migrations/0001_inicial.sql. Si cambias el SQL, actualiza esto.
 * (Más adelante se pueden generar solos con: npx supabase gen types typescript)
 */
export type TipoLataDB = "otra" | "auspiciadora";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; alias: string | null; qr_token: string; created_at: string };
        Insert: { id: string; alias?: string | null; qr_token?: string; created_at?: string };
        Update: { alias?: string | null };
        Relationships: [];
      };
      can_events: {
        Row: { id: number; user_id: string; tipo: TipoLataDB; maquina_id: string; created_at: string };
        Insert: { user_id: string; tipo: TipoLataDB; maquina_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      conteo_latas: {
        Row: { user_id: string; otras: number; auspiciadoras: number };
        Relationships: [];
      };
    };
    Functions: {
      regenerar_qr_token: { Args: Record<string, never>; Returns: string };
      registrar_lata: {
        Args: { p_token: string; p_tipo: TipoLataDB; p_maquina_id: string };
        Returns: { user_id: string; otras: number; auspiciadoras: number }[];
      };
    };
    Enums: { tipo_lata: TipoLataDB };
    CompositeTypes: Record<string, never>;
  };
};
