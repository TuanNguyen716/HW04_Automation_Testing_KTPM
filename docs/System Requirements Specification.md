## Tổng quan Hệ thống

Hệ thống EShop là nền tảng thương mại điện tử bao gồm 4 thành phần:

| Thành phần   | Công nghệ                   | URL mặc định            |
| ------------ | --------------------------- | ----------------------- |
| Backend API  | Node.js + Express + SQLite  | `http://localhost:3000` |
| Frontend Web | React + Vite + Tailwind CSS | `http://localhost:5173` |
| Web Admin    | React + Vite + Tailwind CSS | `http://localhost:5174` |
| Mobile App   | React Native + Expo         | IP LAN của máy chủ      |

**Tài khoản mặc định:**

- Admin: `admin@eshop.com` / `Admin123!`
- User test: `test@eshop.com` / `Test1234!`

---
## Quản lý Tài khoản (Authentication & Authorization)
### FR-02: Đăng nhập & Khóa tài khoản

- Người dùng nhập Email và Mật khẩu.
- Sau mỗi lần đăng nhập sai, hệ thống tăng bộ đếm lên **đúng 1 đơn vị**.
- Nếu đăng nhập sai từ **3 lần trở lên** liên tiếp, tài khoản bị tạm khóa **30 giây** (môi trường demo). Hệ thống trả về thông báo lỗi phù hợp; không để lộ chi tiết nguyên nhân.
- Đăng nhập thành công trả về JWT Token. Token được lưu phía client và gửi kèm tất cả các yêu cầu có xác thực qua header `Authorization: Bearer <token>`.
- Trường email phải dùng `type="email"` (có validate HTML5 format).

## Quản lý Đơn hàng
### FR-11: Xem lịch sử đơn hàng (User)

- Người dùng chỉ xem được đơn hàng của chính mình.
- Hiển thị: Mã đơn, Ngày đặt, Tổng tiền, Trạng thái hiện tại.
- Trạng thái phải được dịch sang tiếng Việt rõ ràng và phân biệt màu sắc.

## Phân hệ Web Admin
### FR-12: Kiểm soát truy cập (Access Control)

- Phân hệ Admin chỉ dành cho tài khoản có `role = 'admin'`.
- **Tất cả** các API Admin (`/api/admin/*`) và các API có tính ảnh hưởng dữ liệu (`POST/PUT/DELETE /api/products`, `/api/categories`, `/api/coupons`) đều phải yêu cầu:
  1. Token JWT hợp lệ.
  2. `role = 'admin'` trong Token.