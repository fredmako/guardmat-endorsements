import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ENDORSEMENT_ID_PREFIX } from '@/lib/constants';

function generateEndorsementId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${ENDORSEMENT_ID_PREFIX}${num}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, schoolName, parentName, phone, email, message, consent, verified } = body;

    if (!schoolId || !schoolName || !parentName || !phone || !email || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!verified) {
      return NextResponse.json({ error: 'Phone verification required' }, { status: 400 });
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Duplicate detection
    const { data: existing } = await supabaseAdmin
      .from('endorsements')
      .select('id')
      .eq('phone', phone)
      .eq('school_id', schoolId)
      .eq('verified', true)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You have already endorsed this school' }, { status: 409 });
    }

    const endorsementId = generateEndorsementId();

    const { data, error } = await supabaseAdmin
      .from('endorsements')
      .insert({
        endorsement_id: endorsementId,
        school_id: schoolId,
        school_name: schoolName,
        parent_name: parentName,
        phone,
        email,
        message: message || null,
        consent,
        verified: true,
        flagged: false,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      event_type: 'endorsement_complete',
      school_id: schoolId,
      referral_source: body.referralSource || null,
    });

    return NextResponse.json({
      success: true,
      endorsementId: data.endorsement_id,
      message: 'Endorsement submitted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
