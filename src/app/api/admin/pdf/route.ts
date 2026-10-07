import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEndorsementPDF, generateBulkEndorsePDF } from '@/lib/endorsementPdf';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const startDate = searchParams.get('start') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const endDate = searchParams.get('end') || new Date().toISOString().slice(0, 10);

    // Single endorsement PDF
    if (id) {
      const { data: endorsement, error } = await supabaseAdmin
        .from('endorsements')
        .select('*')
        .eq('endorsement_id', id)
        .single();

      if (error || !endorsement) {
        return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 });
      }

      const pdfBytes = await generateEndorsementPDF(endorsement);

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="endorsement-${id}.pdf"`,
        },
      });
    }

    // Bulk PDF report
    const { data: endorsements, error: listError } = await supabaseAdmin
      .from('endorsements')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (listError) throw listError;

    const pdfBytes = await generateBulkEndorsePDF(endorsements || []);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="guardmat-endorsements-${startDate}-${endDate}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
