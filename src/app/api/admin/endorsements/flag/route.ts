import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { endorsementId, action, reason } = body;

    if (!endorsementId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'flag') {
      const { error } = await supabaseAdmin
        .from('endorsements')
        .update({ flagged: true, flag_reason: reason || 'Flagged by admin' })
        .eq('endorsement_id', endorsementId);

      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        action: 'flag_endorsement',
        entity_type: 'endorsement',
        entity_id: endorsementId,
        admin_email: adminUser.email,
        details: { reason },
      });

      return NextResponse.json({ success: true, message: 'Endorsement flagged' });
    }

    if (action === 'revoke') {
      const { error } = await supabaseAdmin
        .from('endorsements')
        .update({ flagged: true, flag_reason: reason || 'Revoked by admin' })
        .eq('endorsement_id', endorsementId);

      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        action: 'revoke_endorsement',
        entity_type: 'endorsement',
        entity_id: endorsementId,
        admin_email: adminUser.email,
        details: { reason },
      });

      return NextResponse.json({ success: true, message: 'Endorsement revoked' });
    }

    if (action === 'unflag') {
      const { error } = await supabaseAdmin
        .from('endorsements')
        .update({ flagged: false, flag_reason: null })
        .eq('endorsement_id', endorsementId);

      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        action: 'unflag_endorsement',
        entity_type: 'endorsement',
        entity_id: endorsementId,
        admin_email: adminUser.email,
        details: {},
      });

      return NextResponse.json({ success: true, message: 'Endorsement unflagged' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
