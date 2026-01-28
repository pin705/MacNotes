import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const notes = await Note.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const note = await Note.create(body);
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
