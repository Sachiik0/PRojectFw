export interface Profile {
  id: string;
  pen_name: string;
  email: string;
  created_at: string;
  updated_at?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  reports_count: number;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
  profiles?: Profile;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  post_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  posts?: Post;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'follow';
  content: string;
  is_read: boolean;
  created_at: string;
  actor_id?: string;
  post_id?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  pen_name?: string;
  created_at?: string;
}