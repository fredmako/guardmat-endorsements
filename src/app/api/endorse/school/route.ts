import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { schoolId, schoolName, parentName, phone, email, message, consent, verified, referralSource } = await request.json();

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

    // Generate endorsement ID
    const num = Math.floor(100000 + Math.random() * 900000);
    const endorsementId = `GUARDMAT-END-2026-${num}`;

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
      referral_source: referralSource || null,
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
