export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          pen_name: string
          email: string
          created_at: string
          followers_count: number
          following_count: number
          posts_count: number
        }
        Insert: {
          id: string
          pen_name: string
          email: string
          created_at?: string
          followers_count?: number
          following_count?: number
          posts_count?: number
        }
        Update: {
          id?: string
          pen_name?: string
          email?: string
          created_at?: string
          followers_count?: number
          following_count?: number
          posts_count?: number
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          likes_count: number
          reports_count: number
          created_at: string
          updated_at: string
          is_hidden: boolean
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          likes_count?: number
          reports_count?: number
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          likes_count?: number
          reports_count?: number
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          post_id: string
          reason: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          post_id: string
          reason: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          post_id?: string
          reason?: string
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      last_notification_sent: {
        Row: {
          user_id: string
          last_sent_at: string
        }
        Insert: {
          user_id: string
          last_sent_at?: string
        }
        Update: {
          user_id?: string
          last_sent_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
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