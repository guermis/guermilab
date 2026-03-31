export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_stats: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      ai_suggestions: {
        Row: {
          created_at: string
          id: string
          is_applied: boolean
          project_id: string | null
          suggestion_data: Json
          suggestion_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_applied?: boolean
          project_id?: string | null
          suggestion_data?: Json
          suggestion_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_applied?: boolean
          project_id?: string | null
          suggestion_data?: Json
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string
          project_slug: string | null
          session_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          project_slug?: string | null
          session_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          project_slug?: string | null
          session_id?: string
          value?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          metadata: Json | null
          name: string
          project_interest: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          metadata?: Json | null
          name: string
          project_interest?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string
          project_interest?: string | null
          source?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          alt: string | null
          block_type: string
          body: string | null
          caption: string | null
          created_at: string
          heading: string | null
          id: string
          project_id: string
          quote_author: string | null
          quote_text: string | null
          sort_order: number
          src: string | null
          updated_at: string
        }
        Insert: {
          alt?: string | null
          block_type: string
          body?: string | null
          caption?: string | null
          created_at?: string
          heading?: string | null
          id?: string
          project_id: string
          quote_author?: string | null
          quote_text?: string | null
          sort_order?: number
          src?: string | null
          updated_at?: string
        }
        Update: {
          alt?: string | null
          block_type?: string
          body?: string | null
          caption?: string | null
          created_at?: string
          heading?: string | null
          id?: string
          project_id?: string
          quote_author?: string | null
          quote_text?: string | null
          sort_order?: number
          src?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      photography_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photography_photos: {
        Row: {
          album_id: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "photography_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photography_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      project_themes: {
        Row: {
          color_accent: string | null
          color_background: string | null
          color_foreground: string | null
          color_primary: string | null
          color_secondary: string | null
          created_at: string
          font_body: string | null
          font_display: string | null
          id: string
          project_id: string
          spacing_base: number | null
          updated_at: string
        }
        Insert: {
          color_accent?: string | null
          color_background?: string | null
          color_foreground?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          font_body?: string | null
          font_display?: string | null
          id?: string
          project_id: string
          spacing_base?: number | null
          updated_at?: string
        }
        Update: {
          color_accent?: string | null
          color_background?: string | null
          color_foreground?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          font_body?: string | null
          font_display?: string | null
          id?: string
          project_id?: string
          spacing_base?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          access_password: string | null
          category: string | null
          client_name: string | null
          context: string | null
          created_at: string
          director_notes: Json | null
          duration: string | null
          execution: string | null
          hero_image_url: string | null
          id: string
          is_private: boolean
          is_published: boolean
          long_description: string | null
          main_video_url: string | null
          result: string | null
          role_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          access_password?: string | null
          category?: string | null
          client_name?: string | null
          context?: string | null
          created_at?: string
          director_notes?: Json | null
          duration?: string | null
          execution?: string | null
          hero_image_url?: string | null
          id?: string
          is_private?: boolean
          is_published?: boolean
          long_description?: string | null
          main_video_url?: string | null
          result?: string | null
          role_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          access_password?: string | null
          category?: string | null
          client_name?: string | null
          context?: string | null
          created_at?: string
          director_notes?: Json | null
          duration?: string | null
          execution?: string | null
          hero_image_url?: string | null
          id?: string
          is_private?: boolean
          is_published?: boolean
          long_description?: string | null
          main_video_url?: string | null
          result?: string | null
          role_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          border_radius: number
          color_accent: string
          color_background: string
          color_border: string
          color_foreground: string
          color_muted: string
          color_primary: string
          color_secondary: string
          created_at: string
          font_body: string
          font_display: string
          id: string
          is_active: boolean
          name: string
          spacing_base: number
          updated_at: string
        }
        Insert: {
          border_radius?: number
          color_accent?: string
          color_background?: string
          color_border?: string
          color_foreground?: string
          color_muted?: string
          color_primary?: string
          color_secondary?: string
          created_at?: string
          font_body?: string
          font_display?: string
          id?: string
          is_active?: boolean
          name?: string
          spacing_base?: number
          updated_at?: string
        }
        Update: {
          border_radius?: number
          color_accent?: string
          color_background?: string
          color_border?: string
          color_foreground?: string
          color_muted?: string
          color_primary?: string
          color_secondary?: string
          created_at?: string
          font_body?: string
          font_display?: string
          id?: string
          is_active?: boolean
          name?: string
          spacing_base?: number
          updated_at?: string
        }
        Relationships: []
      }
      videos_horizontal: {
        Row: {
          client: string | null
          created_at: string
          duration: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          client?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          client?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      videos_vertical: {
        Row: {
          client: string | null
          created_at: string
          duration: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          client?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          client?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      projects_public: {
        Row: {
          category: string | null
          client_name: string | null
          context: string | null
          created_at: string | null
          director_notes: Json | null
          duration: string | null
          execution: string | null
          hero_image_url: string | null
          id: string | null
          is_private: boolean | null
          is_published: boolean | null
          long_description: string | null
          main_video_url: string | null
          result: string | null
          role_title: string | null
          short_description: string | null
          slug: string | null
          sort_order: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          context?: string | null
          created_at?: string | null
          director_notes?: Json | null
          duration?: string | null
          execution?: string | null
          hero_image_url?: string | null
          id?: string | null
          is_private?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          main_video_url?: string | null
          result?: string | null
          role_title?: string | null
          short_description?: string | null
          slug?: string | null
          sort_order?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          category?: string | null
          client_name?: string | null
          context?: string | null
          created_at?: string | null
          director_notes?: Json | null
          duration?: string | null
          execution?: string | null
          hero_image_url?: string | null
          id?: string | null
          is_private?: boolean | null
          is_published?: boolean | null
          long_description?: string | null
          main_video_url?: string | null
          result?: string | null
          role_title?: string | null
          short_description?: string | null
          slug?: string | null
          sort_order?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
