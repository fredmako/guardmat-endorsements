import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({
        totalPoints: 0,
        endorsementsCount: 0,
      });
    }

    return NextResponse.json({
      totalPoints: data.total_points,
      endorsementsCount: data.endorsements_count,
      lastUpdated: data.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}