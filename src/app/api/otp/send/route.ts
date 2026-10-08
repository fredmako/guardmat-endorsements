import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { OTP_LENGTH, OTP_EXPIRY_MINUTES, ORG_NAME } from '@/lib/constants';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string, name: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Guardmat <onboarding@resend.dev>',
        to: [email],
        subject: `Your ${ORG_NAME} Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #228B45; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${ORG_NAME}</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Endorsement</h2>
              <p style="color: #666;">Hello ${name},</p>
              <p style="color: #666;">Your verification code is:</p>
              <div style="background: #228B45; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #999; font-size: 14px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
              <p style="color: #999; font-size: 14px;">If you did not request this code, please ignore this email.</p>
            </div>
            <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999; font-size: 12px; margin: 0;">Kisii County, Kenya</p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Resend API error:', res.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, email, name } = await request.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        phone,
        email,
        otp_code: otp,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
      });

    if (error) throw error;

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, name || 'there');

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
