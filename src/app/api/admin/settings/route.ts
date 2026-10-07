import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    const settings = await request.json();

    // Update or create campaign settings
    const { data: existing } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('active', true)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('campaigns')
        .update({
          name: settings.campaignName,
          description: settings.campaignDescription,
          target_endorsements: settings.targetEndorsements,
          start_date: settings.campaignStart,
          end_date: settings.campaignEnd,
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('campaigns')
        .insert({
          name: settings.campaignName,
          description: settings.campaignDescription,
          target_endorsements: settings.targetEndorsements,
          start_date: settings.campaignStart,
          end_date: settings.campaignEnd,
          active: true,
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
