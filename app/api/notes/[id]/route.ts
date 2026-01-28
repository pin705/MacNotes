import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const note = await Note.findOne({ _id: id, userId });
    if (!note) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true, runValidators: true }
    );
    if (!note) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

  try {
    if (permanent) {
      // Permanently delete
      const deletedNote = await Note.deleteOne({ _id: id, userId });
      if (!deletedNote) {
        return NextResponse.json({ success: false }, { status: 404 });
      }
      return NextResponse.json({ success: true, deleted: true });
    } else {
      // Soft delete (move to trash)
      const note = await Note.findOneAndUpdate(
        { _id: id, userId },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      if (!note) {
        return NextResponse.json({ success: false }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: note });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
