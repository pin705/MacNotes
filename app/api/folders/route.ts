import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import { NextRequest, NextResponse } from 'next/server';
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
        const folders = await Folder.find({ userId }).sort({ name: 1 });
        return NextResponse.json(folders);
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
        const folder = await Folder.create({
            ...body,
            userId,
        });
        return NextResponse.json(folder, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
