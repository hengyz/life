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

export interface TimelineListResponse {
  nodes: TimelineNode[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MediaInput {
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  sort_order?: number;
}

export interface PrepProfile {
  id: number;
  title: string;
  wedding_date: string;
  total_budget: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PrepBudgetItem {
  id: number;
  category: string;
  name: string;
  estimated_amount: number;
  actual_amount: number;
  status: 'planned' | 'paid' | 'cancelled';
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PrepChecklistItem {
  id: number;
  category: string;
  title: string;
  due_date: string;
  completed: boolean;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PrepOverview {
  profile: PrepProfile;
  budget: { estimated: number; actual: number; paid: number; total: number };
  checklist: { completed: number; total: number };
}
