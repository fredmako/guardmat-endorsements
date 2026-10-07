import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endorsementId = searchParams.get('id');

    if (!endorsementId) {
      return NextResponse.json({ error: 'Endorsement ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('endorsements')
      .select('endorsement_id, school_name, parent_name, message, verified, flagged, created_at, verified_at')
      .eq('endorsement_id', endorsementId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 });
    }

    if (data.flagged) {
      return NextResponse.json({
        endorsementId: data.endorsement_id,
        status: 'revoked',
        message: 'This endorsement has been revoked due to suspicious activity.',
      });
    }

    return NextResponse.json({
      endorsementId: data.endorsement_id,
      schoolName: data.school_name,
      parentName: data.parent_name,
      message: data.message,
      verified: data.verified,
      createdAt: data.created_at,
      verifiedAt: data.verified_at,
      status: data.verified ? 'verified' : 'pending',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
