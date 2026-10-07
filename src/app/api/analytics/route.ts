import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, schoolId, campaignId, referralSource } = body;

    const validTypes = ['page_view', 'endorsement_start', 'endorsement_complete', 'qr_scan', 'social_share', 'verification'];
    if (!validTypes.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: eventType,
        school_id: schoolId || null,
        campaign_id: campaignId || null,
        referral_source: referralSource || null,
        user_agent: request.headers.get('user-agent'),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
