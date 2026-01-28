import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCurrentUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
}

export async function GET() {
    await dbConnect();

    const userId = await getCurrentUserId();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all unique tags from user's notes
        const notes = await Note.find({ userId, isDeleted: false }).select('tags');
        const tagCounts: Record<string, number> = {};

        notes.forEach(note => {
            note.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const tags = Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json(tags);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
