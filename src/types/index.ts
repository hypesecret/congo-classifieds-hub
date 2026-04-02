export interface Listing {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  price: number;
  isFree?: boolean;
  is_free?: boolean;
  city: string;
  neighborhood?: string;
  category: string;
  category_id?: string;
  subcategory_id?: string;
  imageUrl: string;
  images?: string[];
  cover_image?: string;
  isSponsored: boolean;
  is_sponsored?: boolean;
  sponsorLevel?: 'visibility' | 'premium' | 'pro';
  sponsor_level?: string;
  createdAt: string;
  created_at?: string;
  userName: string;
  isVerified: boolean;
  priceNegotiable: boolean;
  price_negotiable?: boolean;
  status?: string;
  views_count?: number;
  contact_count?: number;
  specs?: Record<string, string | number | boolean>;
  profiles?: {
    full_name: string;
    kyc_level: number;
    kyc_status: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color?: string;
  count?: number;
  listings_count?: number;
  is_active?: boolean;
  parent_id?: string;
  subcategories?: Category[];
}

export interface User {
  id: string;
  email?: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  city: string;
  kycStatus: 'none' | 'phone_verified' | 'pending' | 'approved' | 'rejected';
  kycLevel: number;
  listingsCount: number;
  responseRate?: number;
  createdAt?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
    kyc_level: number;
    kyc_status: string;
  };
  listing?: {
    id: string;
    title: string;
    cover_image?: string;
    price?: number;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}
