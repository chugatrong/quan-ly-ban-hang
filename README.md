# Hệ Thống In Bill

Ứng dụng web đơn giản để quản lý và in hóa đơn, có thể nhập danh sách món ăn từ file Excel.

## Các tính năng

- Nhập danh sách món ăn từ file Excel
- Hiển thị danh sách món ăn
- Thêm món vào hóa đơn
- Tăng/giảm số lượng món
- Tính tổng tiền tự động
- In hóa đơn
- Xóa hóa đơn

## Cách sử dụng

1. **Tải lên danh sách món ăn**:
   - Click vào nút "Chọn file" và chọn file Excel chứa danh sách món ăn.
   - File Excel nên có các cột: "Tên món" và "Giá" (hoặc tương tự).
   - Nếu không tải lên file, hệ thống sẽ hiển thị danh sách món ăn mẫu.

2. **Thêm món vào hóa đơn**:
   - Click vào nút "Thêm vào hóa đơn" bên dưới món ăn muốn thêm.
   - Nếu món đã có trong hóa đơn, số lượng sẽ tăng lên 1.

3. **Chỉnh sửa số lượng**:
   - Sử dụng nút "+" và "-" để tăng hoặc giảm số lượng món.
   - Nếu giảm số lượng xuống 0, món sẽ bị xóa khỏi hóa đơn.

4. **Xóa món khỏi hóa đơn**:
   - Click vào nút "Xóa" để xóa món khỏi hóa đơn.

5. **Nhập thông tin khách hàng**:
   - Nhập tên khách hàng và số bàn (nếu có).

6. **In hóa đơn**:
   - Click vào nút "In hóa đơn" để in.
   - Hệ thống sẽ hiển thị cửa sổ in của trình duyệt.

7. **Xóa hóa đơn**:
   - Click vào nút "Xóa hóa đơn" để xóa toàn bộ thông tin hóa đơn hiện tại.

## Định dạng file Excel

File Excel nên có cấu trúc như sau:
- Cột A: Tên món ăn (có thể đặt tên cột là "Tên món", "Tên", "Món",...)
- Cột B: Giá (có thể đặt tên cột là "Giá", "Đơn giá", "Giá tiền",...)

Ví dụ:
| Tên món | Giá     |
|---------|---------|
| Phở bò  | 50000   |
| Bún chả | 45000   |
| Cơm rang| 40000   |

## Cách triển khai trên GitHub Pages

1. Tạo repository trên GitHub
2. Tải tất cả các file (index.html, styles.css, script.js) lên repository
3. Trong repository, vào phần Settings > Pages
4. Trong phần Source, chọn "main" branch và thư mục root, sau đó click Save
5. GitHub sẽ cung cấp URL để truy cập ứng dụng

## Lưu ý

- Ứng dụng này chạy hoàn toàn ở client-side, không cần server.
- Dữ liệu không được lưu lại sau khi làm mới trang.
- Để đảm bảo hoạt động tốt, bạn nên sử dụng các trình duyệt hiện đại như Chrome, Firefox, Safari. 