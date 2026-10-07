export interface School {
  id: string;
  name: string;
  slug: string;
  location: string;
  created_at: string;
}

export interface Endorsement {
  id: string;
  endorsement_id: string;
  school_id: string;
  school_name: string;
  parent_name: string;
  phone: string;
  message: string | null;
  consent: boolean;
  verified: boolean;
  flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  verified_at: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  target_endorsements: number;
  active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: 'page_view' | 'endorsement_start' | 'endorsement_complete' | 'qr_scan' | 'social_share' | 'verification';
  school_id: string | null;
  campaign_id: string | null;
  referral_source: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  created_at: string;
}
