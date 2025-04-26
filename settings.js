document.addEventListener('DOMContentLoaded', function() {
    // Các phần tử DOM
    const storeNameInput = document.getElementById('store-name');
    const storePhoneInput = document.getElementById('store-phone');
    const storeAddressInput = document.getElementById('store-address');
    const storeEmailInput = document.getElementById('store-email');
    const bankNameSelect = document.getElementById('bank-name');
    const bankAccountInput = document.getElementById('bank-account');
    const accountNameInput = document.getElementById('account-name');
    const invoiceNoteInput = document.getElementById('invoice-note');
    const returnPolicyInput = document.getElementById('return-policy');
    const generateQrButton = document.getElementById('generate-qr');
    const downloadQrButton = document.getElementById('download-qr');
    const qrContainer = document.getElementById('qr-container');
    const qrStatus = document.getElementById('qr-status');
    const saveSettingsButton = document.getElementById('save-settings');
    const resetSettingsButton = document.getElementById('reset-settings');
    
    // Các khóa localStorage
    const STORE_SETTINGS_KEY = 'storeSettings';
    
    // Tải cài đặt từ localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Thiết lập giá trị cho các trường nhập liệu
                storeNameInput.value = settings.storeName || '';
                storePhoneInput.value = settings.storePhone || '';
                storeAddressInput.value = settings.storeAddress || '';
                storeEmailInput.value = settings.storeEmail || '';
                bankNameSelect.value = settings.bankName || '';
                bankAccountInput.value = settings.bankAccount || '';
                accountNameInput.value = settings.accountName || '';
                invoiceNoteInput.value = settings.invoiceNote || 'Trân trọng cảm ơn quý khách!';
                returnPolicyInput.value = settings.returnPolicy || 'Hẹn gặp lại!';
                
                // Nếu có thông tin ngân hàng, hiển thị QR Code
                if (settings.bankName && settings.bankAccount && settings.accountName) {
                    generateVietQR();
                }
            } catch (e) {
                console.error('Lỗi khi tải cài đặt:', e);
            }
        } else {
            // Thiết lập giá trị mặc định
            setDefaultValues();
        }
    }
    
    // Thiết lập giá trị mặc định
    function setDefaultValues() {
        invoiceNoteInput.value = 'Trân trọng cảm ơn quý khách!';
        returnPolicyInput.value = 'Hẹn gặp lại!';
    }
    
    // Lưu cài đặt vào localStorage
    function saveSettings() {
        const settings = {
            storeName: storeNameInput.value.trim(),
            storePhone: storePhoneInput.value.trim(),
            storeAddress: storeAddressInput.value.trim(),
            storeEmail: storeEmailInput.value.trim(),
            bankName: bankNameSelect.value,
            bankAccount: bankAccountInput.value.trim(),
            accountName: accountNameInput.value.trim(),
            invoiceNote: invoiceNoteInput.value.trim(),
            returnPolicy: returnPolicyInput.value.trim()
        };
        
        localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
        alert('Đã lưu cài đặt thành công!');
    }
    
    // Khôi phục cài đặt mặc định
    function resetSettings() {
        if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
            storeNameInput.value = '';
            storePhoneInput.value = '';
            storeAddressInput.value = '';
            storeEmailInput.value = '';
            bankNameSelect.value = '';
            bankAccountInput.value = '';
            accountNameInput.value = '';
            setDefaultValues();
            
            // Xóa QR Code
            qrContainer.innerHTML = '';
            qrStatus.textContent = 'Nhập thông tin ngân hàng để tạo mã QR';
            downloadQrButton.disabled = true;
            
            localStorage.removeItem(STORE_SETTINGS_KEY);
            alert('Đã khôi phục cài đặt mặc định!');
        }
    }
    
    // Tạo QR VietQR
    function generateVietQR() {
        // Xóa QR Code cũ nếu có
        qrContainer.innerHTML = '';
        
        const bankName = bankNameSelect.value;
        const bankAccount = bankAccountInput.value.trim();
        const accountName = accountNameInput.value.trim();
        
        if (!bankName || !bankAccount || !accountName) {
            qrStatus.textContent = 'Vui lòng nhập đầy đủ thông tin ngân hàng';
            downloadQrButton.disabled = true;
            return;
        }
        
        // Tạo URL cho VietQR
        // Tham khảo: https://vietqr.io/portal/en/docs/payment-qr-code/
        const amount = ''; // Để trống vì số tiền sẽ được điền khi thanh toán
        const description = 'Thanh toan hoa don'; // Mô tả thanh toán
        
        // Tạo URL VietQR
        const vietqrUrl = `https://img.vietqr.io/image/${bankName}-${bankAccount}-compact2.jpg?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(accountName)}`;
        
        // Hiển thị hình ảnh QR
        const img = document.createElement('img');
        img.src = vietqrUrl;
        img.alt = 'QR Code thanh toán';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        
        qrContainer.appendChild(img);
        qrStatus.textContent = 'QR Code đã được tạo thành công';
        downloadQrButton.disabled = false;
        
        // Lưu URL để tải xuống
        qrContainer.dataset.qrUrl = vietqrUrl;
    }
    
    // Tải xuống QR Code
    function downloadQR() {
        const qrUrl = qrContainer.dataset.qrUrl;
        if (!qrUrl) return;
        
        // Tạo một thẻ a tạm thời để tải xuống
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = 'vietqr-' + bankAccountInput.value.trim() + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // Thêm sự kiện cho các nút
    generateQrButton.addEventListener('click', generateVietQR);
    downloadQrButton.addEventListener('click', downloadQR);
    saveSettingsButton.addEventListener('click', saveSettings);
    resetSettingsButton.addEventListener('click', resetSettings);
    
    // Khởi tạo trang cài đặt
    loadSettings();
}); 