# Caro AI Arena - Hướng dẫn Tùy chỉnh

Chào mừng bạn đến với Caro AI Arena! Tài liệu này sẽ hướng dẫn bạn cách tùy chỉnh và thêm các tài sản của riêng bạn vào trò chơi, chẳng hạn như avatar và hiệu ứng âm thanh.

## 1. Cấu trúc Thư mục Tài sản

Tất cả các tài sản công cộng (hình ảnh, âm thanh) nên được đặt trong thư mục `public`. Nếu thư mục này chưa tồn tại ở gốc dự án của bạn, hãy tạo nó. Bên trong `public`, hãy tạo các thư mục con sau:

```
/public
|-- /assets
|   |-- /avatars
|   |   |-- avatar_1.png
|   |   |-- bot_1.png
|   |   |-- ...
|   |-- /sounds
|   |   |-- music.mp3
|   |   |-- move.mp3
|   |   |-- win.mp3
|   |   |-- lose.mp3
|   |   |-- click.mp3
```

## 2. Thêm Avatar Tùy chỉnh

Hệ thống avatar giờ đây sử dụng các đường dẫn tệp trực tiếp, giúp việc thêm mới trở nên cực kỳ đơn giản.

**Bước 1: Chuẩn bị Hình ảnh của bạn**

*   Tạo hình ảnh avatar của bạn dưới dạng tệp PNG (khuyến khích có nền trong suốt).
*   Kích thước đề xuất là 128x128 pixels hoặc lớn hơn.
*   Đặt tên tệp một cách có ý nghĩa, ví dụ: `my_cool_avatar.png`.

**Bước 2: Sao chép Tệp vào Thư mục `avatars`**

*   Di chuyển tệp hình ảnh của bạn vào thư mục `/public/assets/avatars/`.

**Bước 3: Đăng ký Avatar trong Game**

*   Mở tệp `constants.tsx`.
*   Tìm đến hằng số `AVATARS`.
*   Thêm một đối tượng mới vào mảng này để định nghĩa avatar của bạn. Mỗi đối tượng cần có:
    *   `id`: một chuỗi định danh duy nhất (ví dụ: `avatar_my_cool_one`).
    *   `name`: Tên sẽ hiển thị trong Shop và Inventory (ví dụ: 'Cool Avatar').
    *   `url`: **Đường dẫn đến tệp hình ảnh của bạn**, tính từ thư mục `public`. Ví dụ: `/assets/avatars/my_cool_avatar.png`.

**Ví dụ:**

```typescript
// Trong file: constants.tsx

export const AVATARS: Avatar[] = [
    { id: 'avatar_2', name: 'Rebel', url: '/assets/avatars/avatar_2.png' },
    { id: 'avatar_3', name: 'Scholar', url: '/assets/avatars/avatar_3.png' },
    // Thêm avatar mới của bạn ở đây
    { id: 'avatar_my_cool_one', name: 'Cool Avatar', url: '/assets/avatars/my_cool_avatar.png' },
];
```

*   **Lưu ý:** Nếu bạn muốn thay đổi avatar mặc định, hãy cập nhật hằng số `DEFAULT_AVATAR` với thông tin tương tự. Tương tự đối với avatar của Bot trong hằng số `BOTS`.

## 3. Thêm Âm thanh và Nhạc nền

Trò chơi đã được tích hợp sẵn logic để phát các hiệu ứng âm thanh và nhạc nền. Bạn chỉ cần cung cấp các tệp âm thanh.

**Bước 1: Chuẩn bị Tệp Âm thanh**

*   Chuẩn bị các tệp âm thanh của bạn ở định dạng `.mp3` hoặc `.wav`.
*   Bạn sẽ cần các tệp cho các hành động sau:
    *   **Nhạc nền:** `music.mp3`
    *   **Đặt quân cờ:** `move.mp3`
    *   **Thắng trận:** `win.mp3`
    *   **Thua trận:** `lose.mp3`
    *   **Nhấp chuột (UI):** `click.mp3`

**Bước 2: Sao chép Tệp vào Thư mục `sounds`**

*   Di chuyển tất cả các tệp âm thanh của bạn vào thư mục `/public/assets/sounds/`.
*   **QUAN TRỌNG:** Tên tệp phải khớp chính xác với danh sách ở trên, vì chúng đã được định nghĩa sẵn trong logic của game tại `hooks/useSound.ts`.

**Bước 3: Chơi Game!**

*   Không cần thay đổi mã nguồn. Trò chơi sẽ tự động tìm và phát các tệp âm thanh này khi các sự kiện tương ứng xảy ra.
*   Bạn có thể bật/tắt âm thanh và nhạc nền trong menu Cài đặt của trò chơi.

Chúc bạn tùy chỉnh vui vẻ!
