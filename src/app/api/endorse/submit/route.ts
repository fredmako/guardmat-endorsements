import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ENDORSEMENT_ID_PREFIX, LOYALTY_POINTS_PER_ENDORSEMENT } from '@/lib/constants';

function generateEndorsementId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${ENDORSEMENT_ID_PREFIX}${num}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, schoolName, parentName, phone, message, consent, userId, userEmail } = body;

    if (!schoolId || !schoolName || !parentName || !phone || !consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
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
        email: userEmail || null,
        message: message || null,
        consent,
        verified: true,
        flagged: false,
        verified_at: new Date().toISOString(),
        user_id: userId,
        auth_provider: 'google',
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

    // Award loyalty points
    const { data: existingPoints } = await supabaseAdmin
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingPoints) {
      await supabaseAdmin
        .from('loyalty_points')
        .update({
          total_points: existingPoints.total_points + LOYALTY_POINTS_PER_ENDORSEMENT,
          endorsements_count: existingPoints.endorsements_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await supabaseAdmin.from('loyalty_points').insert({
        user_id: userId,
        email: userEmail || '',
        total_points: LOYALTY_POINTS_PER_ENDORSEMENT,
        endorsements_count: 1,
      });
    }

    return NextResponse.json({
      success: true,
      endorsementId: data.endorsement_id,
      pointsEarned: LOYALTY_POINTS_PER_ENDORSEMENT,
      message: 'Endorsement submitted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}