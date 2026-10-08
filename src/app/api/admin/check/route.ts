import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !adminUser) {
      return NextResponse.json({ isAdmin: false, error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({
      isAdmin: true,
      email: adminUser.email,
      role: adminUser.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
