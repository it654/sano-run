import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    // 1. Khai báo params là một Promise
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        // 2. Dùng await để lấy id từ params
        const { id } = await params; 

        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID đơn đăng ký' }, { status: 400 });
        }

        // Thực hiện xóa đơn đăng ký trong Database
        await prisma.registration.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ message: 'Xóa đơn đăng ký thành công' }, { status: 200 });
        
    } catch (error) {
        console.error("Lỗi khi xóa đơn đăng ký:", error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống hoặc đơn đăng ký không tồn tại' }, 
            { status: 500 }
        );
    }
}