import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: adminUser, error: authError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', token)
      .single();

    if (authError || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const endDate = searchParams.get('end') || new Date().toISOString().slice(0, 10);

    const { data: endorsements, error } = await supabaseAdmin
      .from('endorsements')
      .select('*')
      .eq('verified', true)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const total = endorsements?.length || 0;
    const bySchool: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    (endorsements || []).forEach((e: any) => {
      bySchool[e.school_name] = (bySchool[e.school_name] || 0) + 1;
      const month = e.created_at.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    const reportData = {
      title: 'Guardmat Community School Feeding Initiative',
      subtitle: 'Endorsement Report',
      period: `${startDate} to ${endDate}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEndorsements: total,
        participatingSchools: Object.keys(bySchool).length,
        flaggedEndorsements: (endorsements || []).filter((e: any) => e.flagged).length,
      },
      bySchool,
      byMonth,
      endorsements: (endorsements || []).map((e: any) => ({
        endorsementId: e.endorsement_id,
        schoolName: e.school_name,
        parentName: e.parent_name,
        date: e.created_at.slice(0, 10),
        verified: e.verified,
        flagged: e.flagged,
      })),
      disclaimer: 'This report is generated automatically. Endorsements represent parent/community support, not official school approval.',
    };

    return NextResponse.json(reportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
