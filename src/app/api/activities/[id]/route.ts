import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // Đảm bảo đường dẫn này khớp với cấu hình NextAuth của bạn

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. KIỂM TRA ĐĂNG NHẬP
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
                        user: true 
                    }
                }
            }
        });

        if (!activity) {
            return NextResponse.json({ error: 'Kết quả không tồn tại hoặc đã bị xóa trước đó' }, { status: 404 });
        }

        // 3. XÁC THỰC QUYỀN SỞ HỮU
        if (activity.registration.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Bạn không có quyền xóa kết quả của vận động viên khác' }, { status: 403 });
        }

        // ==========================================
        // XỬ LÝ LÀM TRÒN KHI TRỪ KM
        // ==========================================
        const currentTotal = activity.registration.totalDistance || 0;
        let newTotal = currentTotal - activity.distance;
        
        // Đề phòng trường hợp lỗi data làm tổng KM bị âm
        if (newTotal < 0) newTotal = 0;

        // Làm tròn đúng 2 chữ số sau dấu phẩy trước khi lưu lại
        const roundedNewTotal = parseFloat(newTotal.toFixed(2));

        // 4. THỰC HIỆN XÓA VÀ CẬP NHẬT
        await prisma.$transaction([
            // Lệnh 1: Xóa activity
            prisma.activity.delete({
                where: {
                    id: id
                }
            }),
            // Lệnh 2: Ghi đè lại tổng KM đã được làm tròn (thay vì dùng decrement)
            prisma.registration.update({
                where: {
                    id: activity.registrationId
                },
                data: {
                    totalDistance: roundedNewTotal // Cập nhật thẳng giá trị mới
                }
            })
        ]);

        return NextResponse.json({ message: 'Xóa kết quả và cập nhật thành tích thành công' }, { status: 200 });
        
    } catch (error) {
        console.error("Lỗi khi xóa kết quả:", error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống khi xử lý yêu cầu' }, 
            { status: 500 }
        );
    }
}