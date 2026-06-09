export interface Env {
  DB: D1Database;
  MEDIA?: R2Bucket;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  R2_PUBLIC_URL?: string;
}

export interface PetProfile {
  id: number;
  name: string;
  avatar_url: string;
  birthday: string;
  home_date: string;
  breed: string;
  gender: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineMedia {
  id: number;
  node_id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface TimelineNode {
  id: number;
  pet_id: number;
  title: string;
  content: string;
  event_date: string;
  location: string;
  tags: string[];
  cover_url: string;
  visibility: 'public' | 'private';
  sort_order: number;
  created_at: string;
  updated_at: string;
  media?: TimelineMedia[];
}
