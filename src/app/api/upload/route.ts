import { NextResponse } from 'next/server';
const IMGBB_API_KEY="c501855dda25f70b12dbe5a362500755"
export async function POST(request: Request) {
  try {
    // Lấy file từ request của Client
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file' }, { status: 400 });
    }

    // Chuyển đổi File thành Base64 để gửi qua ImgBB cho ổn định
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Lấy API Key từ biến môi trường
    const apiKey = IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình IMGBB_API_KEY' }, { status: 500 });
    }

    // Tạo form data để bắn sang ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);

    // Bắn request sang ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await response.json();

    if (data.success) {
      // Thành công: Trả về link ảnh trực tiếp (url) cho Client
      return NextResponse.json({ url: data.data.url }, { status: 200 });
    } else {
      console.error("ImgBB Error:", data);
      return NextResponse.json({ error: 'Lỗi từ dịch vụ ImgBB' }, { status: 400 });
    }
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: 'Lỗi server khi upload ảnh' }, { status: 500 });
  }
}