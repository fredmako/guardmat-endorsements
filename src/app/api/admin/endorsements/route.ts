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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const schoolId = searchParams.get('schoolId') || '';
    const verified = searchParams.get('verified') || '';
    const flagged = searchParams.get('flagged') || '';

    let query = supabaseAdmin
      .from('endorsements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`parent_name.ilike.%${search}%,endorsement_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    if (verified !== '') {
      query = query.eq('verified', verified === 'true');
    }
    if (flagged !== '') {
      query = query.eq('flagged', flagged === 'true');
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      endorsements: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
