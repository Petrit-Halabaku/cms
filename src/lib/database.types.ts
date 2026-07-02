/**
 * Hand-maintained database types matching supabase/migrations.
 * Shape follows the `supabase gen types typescript` output so it plugs
 * straight into @supabase/supabase-js generics. If the schema changes,
 * update this file (or regenerate with the Supabase CLI and reconcile).
 */

export type Locale = "en" | "sq";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      media: {
        Row: {
          id: string;
          storage_path: string;
          alt_en: string | null;
          alt_sq: string | null;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          alt_en?: string | null;
          alt_sq?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          alt_en?: string | null;
          alt_sq?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_categories: {
        Row: {
          id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      project_category_translations: {
        Row: {
          category_id: string;
          locale: Locale;
          name: string;
          slug: string;
          description: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: {
          category_id: string;
          locale: Locale;
          name: string;
          slug: string;
          description?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          category_id?: string;
          locale?: Locale;
          name?: string;
          slug?: string;
          description?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_category_translations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "project_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          category_id: string;
          brand_partner_id: string | null;
          brochure_url: string | null;
          sort_order: number;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          brand_partner_id?: string | null;
          brochure_url?: string | null;
          sort_order?: number;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          brand_partner_id?: string | null;
          brochure_url?: string | null;
          sort_order?: number;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "project_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      project_translations: {
        Row: {
          project_id: string;
          locale: Locale;
          title: string;
          slug: string;
          body: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: {
          project_id: string;
          locale: Locale;
          title: string;
          slug: string;
          body?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          project_id?: string;
          locale?: Locale;
          title?: string;
          slug?: string;
          body?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_translations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "project_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      project_facts: {
        Row: {
          id: string;
          project_id: string;
          locale: Locale;
          label: string;
          value: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          locale: Locale;
          label: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          project_id?: string;
          locale?: Locale;
          label?: string;
          value?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_facts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          media_id: string;
          sort_order: number;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          project_id: string;
          media_id: string;
          sort_order?: number;
          is_featured?: boolean;
        };
        Update: {
          id?: string;
          project_id?: string;
          media_id?: string;
          sort_order?: number;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_images_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          id: string;
          key: string;
        };
        Insert: {
          id?: string;
          key: string;
        };
        Update: {
          id?: string;
          key?: string;
        };
        Relationships: [];
      };
      page_translations: {
        Row: {
          page_id: string;
          locale: Locale;
          title: string;
          slug: string;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: {
          page_id: string;
          locale: Locale;
          title: string;
          slug: string;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          page_id?: string;
          locale?: Locale;
          title?: string;
          slug?: string;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "page_translations_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      page_sections: {
        Row: {
          id: string;
          page_id: string;
          key: string;
          type: string;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          page_id: string;
          key: string;
          type: string;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          page_id?: string;
          key?: string;
          type?: string;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      page_section_translations: {
        Row: {
          section_id: string;
          locale: Locale;
          content: Json;
        };
        Insert: {
          section_id: string;
          locale: Locale;
          content?: Json;
        };
        Update: {
          section_id?: string;
          locale?: Locale;
          content?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "page_section_translations_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "page_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          logo_media_id: string | null;
          url: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          logo_media_id?: string | null;
          url?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          logo_media_id?: string | null;
          url?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "partners_logo_media_id_fkey";
            columns: ["logo_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      faqs: {
        Row: {
          id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      faq_translations: {
        Row: {
          faq_id: string;
          locale: Locale;
          question: string;
          answer: string;
        };
        Insert: {
          faq_id: string;
          locale: Locale;
          question: string;
          answer: string;
        };
        Update: {
          faq_id?: string;
          locale?: Locale;
          question?: string;
          answer?: string;
        };
        Relationships: [
          {
            foreignKeyName: "faq_translations_faq_id_fkey";
            columns: ["faq_id"];
            isOneToOne: false;
            referencedRelation: "faqs";
            referencedColumns: ["id"];
          },
        ];
      };
      form_submissions: {
        Row: {
          id: string;
          form_type: "contact" | "quote";
          payload: Json;
          locale: Locale;
          is_read: boolean;
          is_archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_type: "contact" | "quote";
          payload: Json;
          locale: Locale;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_type?: "contact" | "quote";
          payload?: Json;
          locale?: Locale;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: "admin" | "editor";
        };
        Insert: {
          id: string;
          role: "admin" | "editor";
        };
        Update: {
          id?: string;
          role?: "admin" | "editor";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_editor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
