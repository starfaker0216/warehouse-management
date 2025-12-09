# Hướng Dẫn Cấu Hình Firestore Security Rules

## Lỗi: "Không có quyền truy cập"

Lỗi này xảy ra khi Firestore Security Rules không cho phép thao tác write vào collection `employees`.

## Cách Khắc Phục:

### Bước 1: Truy cập Firestore Rules

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Firestore Database** → Tab **Rules**

### Bước 2: Cập nhật Security Rules

#### Option 1: Test Mode (Chỉ dùng cho Development)

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

⚠️ **Cảnh báo**: Rules này cho phép tất cả người dùng đọc/ghi. Chỉ dùng cho development!

#### Option 2: Production Mode (Khuyến nghị)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi collection employees
    match /employees/{employeeId} {
      allow read, write: if true; // Hoặc thêm điều kiện authentication
    }

    // Cho phép đọc/ghi collection phones
    match /phones/{phoneId} {
      allow read, write: if true;
    }

    // Cho phép đọc/ghi collection imports
    match /imports/{importId} {
      allow read, write: if true;
    }

    // Cho phép đọc/ghi collection config
    match /config/{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### Option 3: Với Authentication (An toàn nhất)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ cho phép khi đã đăng nhập
    match /employees/{employeeId} {
      allow read, write: if request.auth != null;
    }

    match /phones/{phoneId} {
      allow read, write: if request.auth != null;
    }

    match /imports/{importId} {
      allow read, write: if request.auth != null;
    }

    match /config/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Bước 3: Publish Rules

1. Click nút **"Publish"** để lưu rules
2. Đợi vài giây để rules được áp dụng
3. Thử lại thao tác tạo tài khoản

## Lưu Ý:

- **Test Mode**: Chỉ dùng cho development, không an toàn cho production
- **Production Mode**: Cần cấu hình rules phù hợp với yêu cầu bảo mật
- Sau khi cập nhật rules, có thể mất vài giây để áp dụng
- Nếu vẫn gặp lỗi, kiểm tra lại project ID và cấu hình Firebase
