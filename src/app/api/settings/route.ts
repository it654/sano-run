import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Lấy tất cả cài đặt
export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Chuyển array thành object { key: value } cho dễ dùng ở Frontend
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi khi tải cài đặt' }, { status: 500 });
    }
}

// Cập nhật 1 cài đặt
export async function POST(request: Request) {
    try {
        const { key, value } = await request.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
        }

        // Dùng upsert: Nếu chưa có thì tạo mới, có rồi thì ghi đè
        const updatedSetting = await prisma.systemSetting.upsert({
            where: { key: key },
            update: { value: String(value) },
            create: { key: key, value: String(value) }
        });

        return NextResponse.json({ message: 'Lưu cài đặt thành công', data: updatedSetting }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Lỗi khi lưu cài đặt' }, { status: 500 });
    }
}