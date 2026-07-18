import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Đảm bảo đường dẫn này khớp với cấu hình NextAuth của bạn

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. KIỂM TRA ĐĂNG NHẬP (Chặn những kẻ chưa đăng nhập)
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập để thực hiện' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID kết quả chạy' }, { status: 400 });
        }

        // 2. TÌM KẾT QUẢ VÀ THÔNG TIN NGƯỜI SỞ HỮU
        const activity = await prisma.activity.findUnique({
            where: { id: id },
            include: {
                registration: {
                    include: {
                        user: true // Lấy thông tin user (email) để đối chiếu
                    }
                }
            }
        });

        // Kiểm tra xem kết quả có thực sự tồn tại không
        if (!activity) {
            return NextResponse.json({ error: 'Kết quả không tồn tại hoặc đã bị xóa trước đó' }, { status: 404 });
        }

        // 3. XÁC THỰC QUYỀN SỞ HỮU (Chặn những kẻ định xóa trộm của người khác)
        // Nếu email của người đang đăng nhập KHÁC với email của người nộp đơn -> Đuổi cổ!
        if (activity.registration.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Bạn không có quyền xóa kết quả của vận động viên khác' }, { status: 403 });
        }

        // 4. VƯỢT QUA MỌI KIỂM TRA -> THỰC HIỆN XÓA
        await prisma.activity.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ message: 'Xóa kết quả thành công' }, { status: 200 });
        
    } catch (error) {
        console.error("Lỗi khi xóa kết quả:", error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi xử lý yêu cầu' }, 
            { status: 500 }
        );
    }
}