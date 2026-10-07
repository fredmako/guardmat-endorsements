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

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://guardmat-endorsements.vercel.app'}/endorse/${school.slug}`;

    return NextResponse.json({
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        location: school.location,
      },
      qrUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
