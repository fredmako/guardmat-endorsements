import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CAMPAIGN_TARGET, CAMPAIGN_START, CAMPAIGN_END, ENDORSEMENT_ID_PREFIX } from '@/lib/constants';

export async function GET() {
  try {
    const [schoolsRes, endorsementsRes, campaignRes] = await Promise.all([
      supabaseAdmin.from('schools').select('*').order('name'),
      supabaseAdmin.from('endorsements').select('*').eq('verified', true).order('created_at', { ascending: false }),
      supabaseAdmin.from('campaigns').select('*').eq('active', true).single(),
    ]);

    if (schoolsRes.error) throw schoolsRes.error;
    if (endorsementsRes.error) throw endorsementsRes.error;

    const schools = schoolsRes.data || [];
    const endorsements = endorsementsRes.data || [];
    const campaign = campaignRes.data;

    const totalVerified = endorsements.length;
    const participatingSchools = new Set(endorsements.map((e: any) => e.school_id)).size;
    const target = campaign?.target_endorsements || CAMPAIGN_TARGET;
    const progress = Math.min(100, Math.round((totalVerified / target) * 100));

    const now = new Date();
    const startDate = campaign ? new Date(campaign.start_date) : new Date(CAMPAIGN_START);
    const endDate = campaign ? new Date(campaign.end_date) : new Date(CAMPAIGN_END);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const monthKey = now.toISOString().slice(0, 7);
    const monthlyEndorsements = endorsements.filter((e: any) => e.created_at.startsWith(monthKey)).length;

    return NextResponse.json({
      schools,
      stats: {
        totalVerified,
        participatingSchools,
        target,
        progress,
        daysRemaining,
        monthlyEndorsements,
        campaignName: campaign?.name || 'Guardmat Community School Feeding Initiative',
        campaignStart: campaign?.start_date || CAMPAIGN_START,
        campaignEnd: campaign?.end_date || CAMPAIGN_END,
      },
      recentEndorsements: endorsements.slice(0, 10).map((e: any) => ({
        id: e.endorsement_id,
        schoolName: e.school_name,
        parentName: e.parent_name,
        message: e.message,
        createdAt: e.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
