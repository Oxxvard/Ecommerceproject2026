import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { message: 'Seeding disabled in production' },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse('INTERNAL_SERVERerror', 'Erreur serveur'),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    errorResponse('FORBIDDEN', 'Not allowed'),
    { status: 403 }
  );
}
