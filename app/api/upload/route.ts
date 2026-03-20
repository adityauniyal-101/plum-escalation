import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/parser';
import { processEmail } from '@/lib/escalationEngine';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be CSV format' }, { status: 400 });
    }

    const csvContent = await file.text();

    // Parse CSV
    const rawEmails = parseCSV(csvContent);

    // Process each email through escalation engine
    const escalations = rawEmails.map((email, index) => processEmail(email, index));

    return NextResponse.json({
      success: true,
      count: escalations.length,
      escalations,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
