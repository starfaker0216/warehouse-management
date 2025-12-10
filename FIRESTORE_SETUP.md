# Hướng Dẫn Tạo Firestore Database

## Lỗi: "The database (default) does not exist"

Lỗi này xảy ra khi Firestore database chưa được tạo trong Firebase Console. Làm theo các bước sau để tạo database:

### Bước 1: Truy cập Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn (warehouse-management-837db)

### Bước 2: Tạo Firestore Database

1. Trong menu bên trái, click vào **"Firestore Database"** (hoặc **"Build" > "Firestore Database"**)
2. Nếu chưa có database, bạn sẽ thấy nút **"Create database"**
3. Click **"Create database"**

### Bước 3: Chọn Chế Độ

- **Test mode**: Cho phép đọc/ghi trong 30 ngày (phù hợp cho development)
- **Production mode**: Yêu cầu cấu hình Security Rules (phù hợp cho production)

**Khuyến nghị**: Chọn **Test mode** cho lần đầu tiên.

### Bước 4: Chọn Location

- Chọn location gần nhất với bạn (ví dụ: `asia-southeast1` cho Việt Nam)
- Click **"Enable"**

### Bước 5: Đợi Database Khởi Tạo

- Quá trình này có thể mất vài phút
- Khi hoàn thành, bạn sẽ thấy màn hình Firestore Database

### Bước 6: Cấu Hình Security Rules (Nếu cần)

Nếu bạn chọn Production mode, cần cấu hình rules:

1. Vào tab **"Rules"** trong Firestore Database
2. Cập nhật rules để cho phép đọc/ghi (chỉ dùng cho development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

### Bước 7: Kiểm Tra Lại

1. Refresh lại ứng dụng
2. Thử tạo tài khoản admin lại

## Lưu Ý

- **Test mode** chỉ an toàn cho development, không dùng cho production
- Sau khi tạo database, có thể mất vài phút để đồng bộ
- Đảm bảo project ID trong file `.env.local` khớp với project ID trong Firebase Console

## Cấu Trúc Collections Cần Tạo

Sau khi tạo database, các collections sau sẽ được tạo tự động khi sử dụng:

- `employees` - Lưu thông tin nhân viên
- `phones` - Lưu thông tin điện thoại
- `imports` - Lưu phiếu nhập hàng
- `colors` - Lưu danh sách màu sắc
- `suppliers` - Lưu danh sách nhà cung cấp

Bạn không cần tạo các collections này thủ công, chúng sẽ được tạo tự động khi có dữ liệu đầu tiên.
