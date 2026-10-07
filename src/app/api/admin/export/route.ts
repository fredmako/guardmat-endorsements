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
    const format = searchParams.get('format') || 'csv';
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

    if (format === 'json') {
      return NextResponse.json({ endorsements: endorsements || [] });
    }

    // Default CSV
    const headers = ['Endorsement ID', 'School', 'Parent Name', 'Phone', 'Verified', 'Flagged', 'Date'];
    const rows = (endorsements || []).map((e: any) => [
      e.endorsement_id,
      e.school_name,
      e.parent_name,
      e.phone,
      e.verified ? 'Yes' : 'No',
      e.flagged ? 'Yes' : 'No',
      new Date(e.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guardmat-endorsements-${startDate}-${endDate}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
