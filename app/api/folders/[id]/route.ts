import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import Note from '@/models/Note';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCurrentUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
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
        const folder = await Folder.findOneAndUpdate(
            { _id: id, userId },
            body,
            { new: true, runValidators: true }
        );
        if (!folder) {
            return NextResponse.json({ success: false }, { status: 404 });
        }
        return NextResponse.json(folder);
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

    try {
        // Remove folder reference from all notes in this folder
        await Note.updateMany({ folderId: id, userId }, { $unset: { folderId: '' } });

        // Delete the folder
        const deletedFolder = await Folder.deleteOne({ _id: id, userId });
        if (!deletedFolder) {
            return NextResponse.json({ success: false }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
