import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'School slug is required' }, { status: 400 });
    }

    const { data: school, error } = await supabaseAdmin
      .from('schools')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const { count } = await supabaseAdmin
      .from('endorsements')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .eq('verified', true);

    return NextResponse.json({
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        location: school.location,
        endorsementCount: count || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
