export type UserRole = 'student' | 'teacher' | 'organization';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  faculty: string | null;
  avatar: string | null;
  bio: string;
  friends: number[];
  subscriptions: number[];
}

export interface PublicUser {
  id: number;
  username: string;
  role: UserRole;
  faculty: string | null;
  avatar: string | null;
  bio: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Post {
  id: number;
  author: PublicUser;
  title: string;
  content: string;
  is_official: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  image: string | null;
}

export interface Comment {
  id: number;
  post: number;
  author: PublicUser;
  text: string;
  created_at: string;
}

export interface Chat {
  id: number;
  name: string | null;
  display_name: string;
  created_at: string;
  participants: PublicUser[];
}

export interface Message {
  id: number;
  text: string;
  created_at: string;
  sender: PublicUser;
}

export interface ToggleLikeResponse {
  message: string;
  liked: boolean;
}

export interface ToggleFriendResponse {
  message: string;
  is_friend: boolean;
}

export interface ToggleSubscriptionResponse {
  message: string;
  is_subscribed: boolean;
}
