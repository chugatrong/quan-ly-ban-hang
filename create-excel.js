// Script để tạo file Excel mẫu
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra nếu có thư viện XLSX
    if (typeof XLSX === 'undefined') {
        console.error('Thư viện XLSX chưa được tải');
        return;
    }

    // Lấy nút tạo file Excel
    const createExcelButton = document.getElementById('create-excel');
    if (!createExcelButton) return;

    createExcelButton.addEventListener('click', function() {
        createAndDownloadExcel();
    });

    // Hàm tạo và tải xuống file Excel mẫu
    function createAndDownloadExcel() {
        // Dữ liệu mẫu
        const sampleData = [
            { 'Tên món': 'Phở bò', 'Giá': 50000 },
            { 'Tên món': 'Bún chả', 'Giá': 45000 },
            { 'Tên món': 'Cơm rang', 'Giá': 40000 },
            { 'Tên món': 'Gà rán', 'Giá': 60000 },
            { 'Tên món': 'Bánh mì', 'Giá': 25000 },
            { 'Tên món': 'Cà phê', 'Giá': 30000 }
        ];

        // Tạo workbook mới
        const wb = XLSX.utils.book_new();
        
        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.json_to_sheet(sampleData);
        
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Menu');
        
        // Tạo file Excel và tải xuống
        XLSX.writeFile(wb, 'menu-mau.xlsx');
    }
}); 