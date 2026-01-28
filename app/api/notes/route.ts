import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(request: NextRequest) {
  await dbConnect();

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const showArchived = searchParams.get('archived') === 'true';
    const showDeleted = searchParams.get('deleted') === 'true';

    // Build query
    const query: any = { userId };

    if (showDeleted) {
      query.isDeleted = true;
    } else if (showArchived) {
      query.isArchived = true;
      query.isDeleted = false;
    } else {
      query.isDeleted = false;
      query.isArchived = false;
    }

    if (folderId && folderId !== 'all') {
      query.folderId = folderId;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const note = await Note.create({
      ...body,
      userId,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
