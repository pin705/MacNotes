import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    const body = await request.json();
    const note = await Note.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!note) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  try {
    const deletedNote = await Note.deleteOne({ _id: id });
    if (!deletedNote) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deletedNote });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
