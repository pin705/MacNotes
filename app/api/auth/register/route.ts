import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { email, password, name } = await request.json();

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email đã được sử dụng' },
                { status: 400 }
            );
        }

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
        });

        return NextResponse.json(
            {
                message: 'Đăng ký thành công',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
            { status: 500 }
        );
    }
}
