document.addEventListener('DOMContentLoaded', function() {
    // Các phần tử DOM
    const excelFileInput = document.getElementById('excel-file');
    const menuItemsContainer = document.getElementById('menu-items');
    const billItemsBody = document.getElementById('bill-items-body');
    const totalAmountElement = document.getElementById('total-amount');
    const printBillButton = document.getElementById('print-bill');
    const clearBillButton = document.getElementById('clear-bill');
    const customerNameInput = document.getElementById('customer-name');
    const tableNumberInput = document.getElementById('table-number');
    const tableIncreaseButton = document.getElementById('table-increase');
    const tableDecreaseButton = document.getElementById('table-decrease');
    const storeNameInput = document.getElementById('store-name');
    const storeAddressInput = document.getElementById('store-address');
    const paymentCashRadio = document.getElementById('payment-cash');
    const paymentTransferRadio = document.getElementById('payment-transfer');
    const showQrInBillCheckbox = document.getElementById('show-qr-in-bill');
    const printArea = document.getElementById('print-area');
    const menuSearchInput = document.getElementById('menu-search');
    const searchResultsContainer = document.getElementById('search-results');
    const toggleMenuButton = document.getElementById('toggle-menu');
    const saveMenuDataCheckbox = document.getElementById('save-menu-data');
    const clearSavedDataButton = document.getElementById('clear-saved-data');
    const qrPaymentSection = document.getElementById('qr-payment-section');
    const showQrButton = document.getElementById('show-qr');
    const qrModal = document.getElementById('qr-modal');
    const qrImage = document.getElementById('qr-image');
    const qrAmount = document.getElementById('qr-amount');
    const closeModal = document.querySelector('.close');
    
    // Các khóa localStorage
    const STORE_SETTINGS_KEY = 'storeSettings';
    const MENU_DATA_KEY = 'menuItems';
    const SAVE_MENU_DATA_KEY = 'saveMenuData';
    
    // Danh sách món ăn và hóa đơn
    let menuItems = [];
    let billItems = [];
    let isMenuCollapsed = false;
    let storeSettings = null;
    
    // Tải thông tin cửa hàng từ localStorage nếu có
    function loadStoreInfo() {
        const storeName = localStorage.getItem('storeName');
        const storeAddress = localStorage.getItem('storeAddress'); 
    }
    
    // Lưu thông tin cửa hàng vào localStorage
    function saveStoreInfo() {
        localStorage.setItem('storeName', storeNameInput.value);
        localStorage.setItem('storeAddress', storeAddressInput.value);
    }
    
    // Thêm sự kiện lưu thông tin cửa hàng khi thay đổi 
    
    // Xử lý nút tăng/giảm số bàn
    if (tableIncreaseButton && tableDecreaseButton) {
        tableIncreaseButton.addEventListener('click', function() {
            let currentValue = parseInt(tableNumberInput.value) || 0;
            tableNumberInput.value = currentValue + 1;
        });
        
        tableDecreaseButton.addEventListener('click', function() {
            let currentValue = parseInt(tableNumberInput.value) || 0;
            if (currentValue > 1) {
                tableNumberInput.value = currentValue - 1;
            }
        });
    }
    
    // Theo dõi sự thay đổi phương thức thanh toán
    if (paymentCashRadio && paymentTransferRadio) {
        paymentCashRadio.addEventListener('change', function() {
            if (this.checked) {
                // Ẩn phần QR khi chọn tiền mặt
                if (qrPaymentSection) {
                    qrPaymentSection.style.display = 'none';
                }
                // Tự động tắt checkbox hiển thị QR
                if (showQrInBillCheckbox && showQrInBillCheckbox.checked) {
                    showQrInBillCheckbox.checked = false;
                }
            }
        });
        
        paymentTransferRadio.addEventListener('change', function() {
            if (this.checked && storeSettings && storeSettings.bankAccount) {
                // Hiện phần QR khi chọn chuyển khoản
                if (qrPaymentSection) {
                    qrPaymentSection.style.display = 'block';
                }
                // Tự động bật checkbox hiển thị QR 
                if (showQrInBillCheckbox && !showQrInBillCheckbox.checked) {
                    showQrInBillCheckbox.checked = true;
                }
            } else if (this.checked && (!storeSettings || !storeSettings.bankAccount)) {
                alert('Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt để hiển thị mã QR.');
            }
        });
    }
    
    // Theo dõi sự thay đổi checkbox hiển thị QR
    if (showQrInBillCheckbox) {
        showQrInBillCheckbox.addEventListener('change', function() {
            // Nếu checkbox được bật nhưng không có thông tin ngân hàng
            if (this.checked && (!storeSettings || !storeSettings.bankAccount)) {
                alert('Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt để hiển thị mã QR.');
                this.checked = false;
                return;
            }
            
            // Hiển thị nút QR
            if (this.checked) {
                if (qrPaymentSection) {
                    qrPaymentSection.style.display = 'block';
                }
            } else {
                if (qrPaymentSection) {
                    qrPaymentSection.style.display = 'none';
                }
            }
        });
    }
    
    // Hiển thị modal QR
    if (showQrButton) {
        showQrButton.addEventListener('click', function() {
            const total = billItems.reduce((sum, item) => sum + item.total, 0);
            displayQrCode(total);
        });
    }
    
    // Đóng modal QR
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            qrModal.style.display = 'none';
        });
        
        // Đóng modal khi click bên ngoài
        window.addEventListener('click', function(event) {
            if (event.target == qrModal) {
                qrModal.style.display = 'none';
            }
        });
    }
    
    // Hiển thị QR code thanh toán
    function displayQrCode(amount) {
        if (!storeSettings || !storeSettings.bankAccount || !storeSettings.bankName) {
            alert('Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt.');
            return;
        }
        
        // Tạo URL VietQR với số tiền
        const description = 'Thanh toan hoa don';
        const vietqrUrl = `https://img.vietqr.io/image/${storeSettings.bankName}-${storeSettings.bankAccount}-compact2.jpg?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(storeSettings.accountName || '')}`;
        
        // Hiển thị hình ảnh QR
        qrImage.innerHTML = `<img src="${vietqrUrl}" alt="QR Code thanh toán">`;
        qrAmount.textContent = formatCurrency(amount);
        
        // Hiển thị modal
        qrModal.style.display = 'block';
    }
    
    // Tải cài đặt từ localStorage
    function loadStoreSettings() {
        const savedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        if (savedSettings) {
            try {
                storeSettings = JSON.parse(savedSettings);
                
                // Điền thông tin cửa hàng vào form nếu có
                if (storeNameInput && storeSettings.storeName) {
                    storeNameInput.value = storeSettings.storeName;
                }
                
                if (storeAddressInput && storeSettings.storeAddress) {
                    storeAddressInput.value = storeSettings.storeAddress;
                }
                
                // Kiểm tra xem có thông tin ngân hàng không
                if (storeSettings.bankName && storeSettings.bankAccount) {
                    // Hiển thị nút QR khi phương thức thanh toán là chuyển khoản
                    if (paymentTransferRadio && paymentTransferRadio.checked) {
                        qrPaymentSection.style.display = 'block';
                    }
                }
            } catch (e) {
                console.error('Lỗi khi tải cài đặt:', e);
                storeSettings = null;
            }
        }
    }
    
    // Xử lý nút thu gọn/mở rộng danh sách
    if (toggleMenuButton) {
        toggleMenuButton.addEventListener('click', function() {
            toggleMenu();
        });
    }
    
    // Xử lý chức năng tìm kiếm
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', function() {
            handleSearch();
        });
        
        menuSearchInput.addEventListener('focus', function() {
            if (menuSearchInput.value.trim() !== '') {
                showSearchResults();
            }
        });
        
        // Xử lý phím Enter để chọn món đầu tiên trong kết quả tìm kiếm
        menuSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const firstResult = searchResultsContainer.querySelector('.search-item');
                if (firstResult) {
                    const itemIndex = parseInt(firstResult.getAttribute('data-index'));
                    if (!isNaN(itemIndex) && menuItems[itemIndex]) {
                        addToBill(menuItems[itemIndex]);
                        hideSearchResults();
                        menuSearchInput.value = '';
                    }
                }
            }
        });
        
        // Ẩn kết quả tìm kiếm khi nhấp ra ngoài
        document.addEventListener('click', function(e) {
            if (!searchResultsContainer.contains(e.target) && e.target !== menuSearchInput) {
                hideSearchResults();
            }
        });
    }
    
    // Xử lý lưu/tải dữ liệu từ localStorage
    if (saveMenuDataCheckbox) {
        // Kiểm tra trạng thái đã lưu
        const shouldSaveMenu = localStorage.getItem(SAVE_MENU_DATA_KEY);
        saveMenuDataCheckbox.checked = shouldSaveMenu === null ? true : shouldSaveMenu === 'true';
        
        saveMenuDataCheckbox.addEventListener('change', function() {
            localStorage.setItem(SAVE_MENU_DATA_KEY, this.checked);
        });
    }
    
    if (clearSavedDataButton) {
        clearSavedDataButton.addEventListener('click', function() {
            localStorage.removeItem(MENU_DATA_KEY);
            alert('Đã xóa dữ liệu danh sách món ăn đã lưu!');
        });
    }
    
    // Tải dữ liệu từ localStorage nếu có
    function loadSavedMenuItems() {
        const savedData = localStorage.getItem(MENU_DATA_KEY);
        if (savedData) {
            try {
                menuItems = JSON.parse(savedData);
                renderMenuItems();
                return true;
            } catch (e) {
                console.error('Lỗi khi tải dữ liệu đã lưu:', e);
            }
        }
        return false;
    }
    
    // Lưu danh sách món vào localStorage
    function saveMenuItems() {
        if (saveMenuDataCheckbox && saveMenuDataCheckbox.checked) {
            localStorage.setItem(MENU_DATA_KEY, JSON.stringify(menuItems));
        }
    }
    
    // Hàm tìm kiếm món ăn
    function handleSearch() {
        const searchText = menuSearchInput.value.trim().toLowerCase();
        
        if (searchText === '') {
            hideSearchResults();
            return;
        }
        
        const results = menuItems.filter(item => 
            item.name.toLowerCase().includes(searchText)
        );
        
        if (results.length > 0) {
            renderSearchResults(results);
            showSearchResults();
        } else {
            hideSearchResults();
        }
    }
    
    // Hiển thị kết quả tìm kiếm
    function renderSearchResults(results) {
        searchResultsContainer.innerHTML = '';
        
        results.forEach(item => {
            const index = menuItems.findIndex(menuItem => menuItem.name === item.name);
            const resultItem = document.createElement('div');
            resultItem.className = 'search-item';
            resultItem.textContent = `${item.name} - ${formatCurrency(item.price)}`;
            resultItem.setAttribute('data-index', index);
            
            resultItem.addEventListener('click', function() {
                addToBill(item);
                hideSearchResults();
                menuSearchInput.value = '';
            });
            
            searchResultsContainer.appendChild(resultItem);
        });
    }
    
    // Hiển thị khung kết quả tìm kiếm
    function showSearchResults() {
        searchResultsContainer.classList.add('active');
    }
    
    // Ẩn khung kết quả tìm kiếm
    function hideSearchResults() {
        searchResultsContainer.classList.remove('active');
    }
    
    // Thu gọn/mở rộng danh sách món
    function toggleMenu() {
        isMenuCollapsed = !isMenuCollapsed;
        
        if (isMenuCollapsed) {
            menuItemsContainer.classList.add('collapsed');
            toggleMenuButton.textContent = 'Mở rộng';
        } else {
            menuItemsContainer.classList.remove('collapsed');
            toggleMenuButton.textContent = 'Thu gọn';
        }
    }
    
    // Sự kiện khi chọn file Excel
    excelFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Lấy sheet đầu tiên
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Chuyển đổi thành JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Giả sử dữ liệu Excel có định dạng: Tên món, Giá
            menuItems = jsonData.map(item => {
                // Kiểm tra các trường dữ liệu
                const name = item['Tên món'] || item['Tên'] || item['Món'] || Object.values(item)[0];
                const price = item['Giá'] || item['Đơn giá'] || item['Giá tiền'] || Object.values(item)[1];
                
                return {
                    name: name,
                    price: parseFloat(price) || 0
                };
            });
            
            renderMenuItems();
            saveMenuItems(); // Lưu danh sách món mới
        };
        reader.readAsArrayBuffer(file);
    });
    
    // Hiển thị danh sách món ăn
    function renderMenuItems() {
        menuItemsContainer.innerHTML = '';
        
        menuItems.forEach((item, index) => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${formatCurrency(item.price)}</p>
            `;
            
            // Thêm sự kiện click trực tiếp vào section món
            menuItemElement.addEventListener('click', function() {
                addToBill(item);
            });
            
            menuItemsContainer.appendChild(menuItemElement);
        });
    }
    
    // Thêm món vào hóa đơn
    function addToBill(item) {
        // Kiểm tra xem món đã có trong hóa đơn chưa
        const existingItemIndex = billItems.findIndex(billItem => billItem.name === item.name);
        
        if (existingItemIndex !== -1) {
            // Nếu món đã có trong hóa đơn, tăng số lượng lên 1
            billItems[existingItemIndex].quantity += 1;
            billItems[existingItemIndex].total = billItems[existingItemIndex].price * billItems[existingItemIndex].quantity;
        } else {
            // Nếu món chưa có trong hóa đơn, thêm mới
            billItems.push({
                name: item.name,
                price: item.price,
                quantity: 1,
                total: item.price
            });
        }
        
        renderBillItems();
        calculateTotal();
    }
    
    // Hiển thị các món trong hóa đơn
    function renderBillItems() {
        billItemsBody.innerHTML = '';
        
        billItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase" data-index="${index}">+</button>
                    </div>
                </td>
                <td>${formatCurrency(item.total)}</td>
                <td><button class="delete-item" data-index="${index}">Xóa</button></td>
            `;
            
            billItemsBody.appendChild(row);
        });
        
        // Thêm sự kiện cho các nút tăng/giảm số lượng và xóa
        addBillItemEventListeners();
    }
    
    // Thêm sự kiện cho các nút trong hóa đơn
    function addBillItemEventListeners() {
        const decreaseButtons = document.querySelectorAll('.quantity-control .decrease');
        const increaseButtons = document.querySelectorAll('.quantity-control .increase');
        const deleteButtons = document.querySelectorAll('.delete-item');
        
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                decreaseQuantity(index);
            });
        });
        
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                increaseQuantity(index);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeItem(index);
            });
        });
    }
    
    // Giảm số lượng món trong hóa đơn
    function decreaseQuantity(index) {
        if (billItems[index].quantity > 1) {
            billItems[index].quantity -= 1;
            billItems[index].total = billItems[index].price * billItems[index].quantity;
            renderBillItems();
            calculateTotal();
        } else {
            removeItem(index);
        }
    }
    
    // Tăng số lượng món trong hóa đơn
    function increaseQuantity(index) {
        billItems[index].quantity += 1;
        billItems[index].total = billItems[index].price * billItems[index].quantity;
        renderBillItems();
        calculateTotal();
    }
    
    // Xóa món khỏi hóa đơn
    function removeItem(index) {
        billItems.splice(index, 1);
        renderBillItems();
        calculateTotal();
    }
    
    // Cập nhật tổng tiền
    function calculateTotal() {
        // Tính tổng tiền từ mảng billItems
        let subtotal = 0;
        billItems.forEach(item => {
            subtotal += item.total;
        });

        // Tính toán giảm giá
        const discountType = document.querySelector('input[name="discount-type"]:checked').value;
        const discountValue = parseFloat(document.querySelector('#discount-value').value) || 0;
        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100);
        } else {
            discountAmount = discountValue;
        }

        const total = subtotal - discountAmount;

        // Cập nhật hiển thị
        document.querySelector('#subtotal-amount').textContent = formatCurrency(subtotal);
        document.querySelector('#discount-amount').textContent = formatCurrency(discountAmount);
        document.querySelector('#total-amount').textContent = formatCurrency(total);
    }
    
    // Định dạng hiển thị tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
    
    // Tạo mã hóa đơn ngẫu nhiên
    function generateInvoiceCode() {
        const prefix = 'HD';
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
    
    // Sự kiện in hóa đơn
    printBillButton.addEventListener('click', function() {
        printInvoice();
    });
    
    // Hàm in hóa đơn
    function printInvoice() {
        if (billItems.length === 0) {
            alert('Chưa có món ăn nào trong hóa đơn');
            return;
        }
        
        const paymentMethod = 'Tiền mặt'; // Luôn hiển thị "Tiền mặt"
        
        // Tính tổng tiền và giảm giá
        let subtotal = 0;
        billItems.forEach(item => {
            subtotal += item.total;
        });
        
        // Lấy thông tin giảm giá
        const discountType = document.querySelector('input[name="discount-type"]:checked').value;
        const discountValue = parseFloat(document.querySelector('#discount-value').value) || 0;
        let discountAmount = 0;
        
        if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100);
        } else {
            discountAmount = discountValue;
        }
        
        const total = subtotal - discountAmount;
        
        const date = new Date();
        const dateString = date.toLocaleDateString('vi-VN');
        const timeString = date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
        const invoiceCode = generateInvoiceCode();
        
        // Lấy thông tin cửa hàng từ localStorage
        const storeName = storeSettings?.storeName || localStorage.getItem('storeName') || 'Cửa hàng';
        const storeAddress = storeSettings?.storeAddress || localStorage.getItem('storeAddress') || 'Địa chỉ cửa hàng';
        const storePhone = storeSettings?.storePhone || '';
        const storeEmail = storeSettings?.storeEmail || '';
        
        // Lấy ghi chú và chính sách đổi trả từ cài đặt
        const invoiceNote = storeSettings?.invoiceNote || 'Trân trọng cảm ơn quý khách!';
        const returnPolicy = storeSettings?.returnPolicy || 'Hẹn gặp lại!';
        
        // Tạo chuỗi HTML cho các mặt hàng trong hóa đơn
        let billItemsHTML = '';
        billItems.forEach((item, index) => {
            billItemsHTML += `
                <tr>
                    <td colspan="4">
                        <b>
                            ${index + 1}. ${item.name}
                        </b>
                    </td>
                </tr>
                <tr class="border-bottom">
                    <td></td>
                    <td class="text-right">${formatCurrency(item.price)}</td>
                    <td class="text-center" style="width: 15%;">x ${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
            `;
        });
        
        // Tạo mã QR nếu cần thiết
        let qrCodeHTML = '';
        if (showQrInBillCheckbox && showQrInBillCheckbox.checked) {
            if (storeSettings && storeSettings.bankName && storeSettings.bankAccount && storeSettings.accountName) {
                qrCodeHTML = `
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="https://img.vietqr.io/image/${storeSettings.bankName}-${storeSettings.bankAccount}-qr_only.jpg?amount=${total}&addInfo=Thanh toan hoa don ${invoiceCode}&accountName=${encodeURIComponent(storeSettings.accountName || '')}" 
                            alt="QR thanh toán" style="width: 30mm; height: 30mm; display: block; margin: 0 auto;"> 
                    </div>
                `;
            } else {
                qrCodeHTML = `
                    <div style="text-align: center; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeeba; margin: 10px 0; font-size: 12px;">
                        <p style="margin: 0; color: #856404;">
                            <b>Lưu ý:</b> Không thể hiển thị mã QR thanh toán vì chưa cấu hình thông tin ngân hàng.<br>
                            Vui lòng vào phần Cài đặt > Thông tin thanh toán để cập nhật thông tin ngân hàng.
                        </p>
                    </div>
                `;
            }
        }
        
        // Tạo thông tin liên hệ
        let contactInfoHTML = '';
        if (storePhone) {
            contactInfoHTML += `<p><b>SĐT:</b> ${storePhone}</p>`;
        }
        if (storeEmail) {
            contactInfoHTML += `<p><b>Email:</b> ${storeEmail}</p>`;
        }
        
        // Tạo HTML cho phần tổng kết với giảm giá
        let summaryHTML = '';
        if (discountAmount > 0) {
            summaryHTML = `
                <table class="table-total">
                    <tr>
                        <td><b>Tiền hàng</b></td>
                        <td class="text-right">${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                        <td><b>Giảm giá</b></td>
                        <td class="text-right">${formatCurrency(discountAmount)}</td>
                    </tr>
                    <tr>
                        <td><b>Tổng tiền</b></td>
                        <td class="text-right">${formatCurrency(total)}</td>
                    </tr>
                    <tr>
                        <td><b>Hình thức thanh toán</b></td>
                        <td class="text-right">${paymentMethod}</td>
                    </tr>
                </table>
            `;
        } else {
            summaryHTML = `
                <table class="table-total">
                    <tr>
                        <td><b>Tiền hàng</b></td>
                        <td class="text-right">${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                        <td><b>Hình thức thanh toán</b></td>
                        <td class="text-right">${paymentMethod}</td>
                    </tr>
                </table>
            `;
        }
        
        // Sử dụng mẫu HTML dựa theo invoice-mau.html
        const invoiceTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Phiếu Tính Tiền</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
                      rel="stylesheet">
                <style>
                    body {
                        width: 80mm;
                        margin: auto;
                        padding: 5px;
                        font-size: 14px;
                        font-family: "Roboto", sans-serif;
                        font-optical-sizing: auto;
                        font-weight: 600;
                        font-style: normal;
                        font-variation-settings: "wdth" 100;
                    }
                    
                    .text-left.info p {
                        margin: 1px 0;
                    }
                    
                    .invoice-bar {
                        border-top: dashed 1px #000;
                        padding-top: 10px;
                    }
                    
                    .invoice-bar p {
                        margin: 2px 0;
                        text-align: center;
                    }
                    
                    h2 {
                        font-size: 19px !important;
                        font-weight: bold;
                        text-align: center;
                        margin: 10px 0;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 10px;
                        table-layout: fixed;
                        word-wrap: break-word;
                    }
                    
                    th {
                        background-color: #ffffff;
                        text-align: center;
                        padding: 10px 0;
                        margin-bottom: 5px;
                        font-weight: bold;
                        border-bottom: solid 1px;
                    }
                    
                    td {
                        padding: 3px;
                    }
                    
                    .text-right {
                        text-align: right !important;
                    }
                    
                    .text-center {
                        text-align: center !important;
                    }
                    
                    .table-total td {
                        font-weight: bold;
                        padding: 2px;
                    }
                    
                    .table-total tr:first-child td {
                        padding-top: 10px;
                    }
                    
                    .border-bottom {
                        border-bottom: 1px dashed #7c7c7c !important;
                    }
                    
                    .invoice-header {
                        display: flex; 
                        justify-content: space-between; 
                        padding: 5px 0;
                    }
                    
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        
                        body {
                            width: 80mm;
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body style="max-width: 80mm; margin: auto; padding: 10px;">
                <div class="main-wrapper">
                    <div class="page-wrapper">
                        <div class="modal-body" id="invoice">
                            <div class="icon-head text-center mb-2">
                            </div>
                            <div class="text-center info">
                                <h2 class="pb-0" style=" margin: 0; "><b>${storeName}</b></h2>
                                <p class="pt-1" style=" margin: 0; padding: 0;">${storeAddress}</p> 
                            </div> 
                            <h1  class="text-center" >PHIẾU TÍNH TIỀN</h1>
                            <div class="invoice-header">
                                <div>
                                    <b>Số hóa đơn:</b>
                                    <div style="font-size: 13px; font-weight: bold;">${invoiceCode}</div>
                                </div>
                                <div class="text-right">
                                    <b>Ngày:</b> ${dateString}
                                    <div style="font-size: 12px;">${timeString}</div>
                                </div>
                            </div>
                            
                            <!-- Bảng Sản Phẩm -->
                            <table>
                                <thead>
                                    <tr>
                                        <th class="text-left">Sản phẩm</th>
                                        <th class="text-right">Đơn giá</th>
                                        <th class="text-center">SL</th>
                                        <th class="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${billItemsHTML}
                                </tbody>
                            </table>
                            
                            <!-- Bảng Tổng Kết -->
                            ${summaryHTML}
                            
                            <!-- QR thanh toán nếu đã chọn hiển thị QR -->
                            ${qrCodeHTML}
                            
                            <!-- Lời Nhắn -->
                            <div class="invoice-bar">
                                <p><b>${invoiceNote}</b></p>
                                <p>${returnPolicy}</p>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Xóa dòng "Vui lòng giữ lại phiếu sau khi thanh toán và khi đổi hàng."
        const cleanedTemplate = invoiceTemplate.replace(/<p>\*\*\s*Vui lòng giữ lại phiếu.*?<\/p>/g, '');
        
        console.log(cleanedTemplate);

        // Sử dụng iframe cho việc in ấn
        const printFrame = document.getElementById('print-frame');
        const printFrameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
        
        // Mở document trong iframe để viết và đóng lại
        printFrameDoc.open();
        printFrameDoc.write(cleanedTemplate);
        printFrameDoc.close();
        
        // Biến để theo dõi trạng thái in
        let isPrinting = false;
        
        // Sau khi tài liệu đã được tải, in ra
        printFrame.onload = function() {
            // Nếu đã bắt đầu in rồi, không thực hiện lại
            if (isPrinting) return;
            isPrinting = true;
            
            try {
                // Đặt tiêu đề cho cửa sổ in
                const oldTitle = document.title;
                document.title = "Hóa đơn - " + invoiceCode;
                
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
                
                // Khôi phục tiêu đề
                document.title = oldTitle;
                
                // Hỏi người dùng có muốn xóa hóa đơn sau khi in không
                setTimeout(function() {
                    if (confirm('Bạn có muốn xóa hóa đơn sau khi in không?')) {
                        clearBill();
                    }
                }, 1000);
            } catch (e) {
                console.error("Lỗi khi in:", e);
                // Phương án dự phòng: sử dụng cách cũ
                printArea.innerHTML = cleanedTemplate;
                setTimeout(function() {
                    window.print();
                }, 300);
            }
        };
        
        // Nếu onload không được kích hoạt sau 2 giây, sử dụng lại phương pháp cũ
        const fallbackTimeout = setTimeout(function() {
            if (!isPrinting) {
                console.log("Không thể in qua iframe, sử dụng phương pháp dự phòng");
                isPrinting = true;
                printArea.innerHTML = cleanedTemplate;
                setTimeout(function() {
                    window.print();
                }, 300);
            }
        }, 2000);
        
        // Đánh dấu là đã được tải
        printFrameDoc.body.onload = function() {
            printFrame.onload();
            clearTimeout(fallbackTimeout);
        };
        
        // Sau khi in xong, reset giá trị giảm giá về 0
        setTimeout(() => {
            document.querySelector('#discount-value').value = '0';
            calculateTotal();
        }, 1000);
    }
    
    // Hàm xóa hóa đơn
    function clearBill() {
        billItems = [];
        renderBillItems();
        calculateTotal();
        customerNameInput.value = '';
        tableNumberInput.value = '';
        // Reset giá trị giảm giá về 0
        document.querySelector('#discount-value').value = '0';
        calculateTotal();
    }
    
    // Sự kiện xóa hóa đơn
    clearBillButton.addEventListener('click', function() {
        clearBill();
    });
    
    // Tạo một số món ăn mẫu để hiển thị khi không có file Excel
    function createSampleMenuItems() {
        menuItems = [
            // các món nhậu 
            { name: 'Bia', price: 25000, image: 'bia.jpg' },
            { name: 'Nước', price: 15000, image: 'nuoc.jpg' },
            { name: 'Bánh', price: 10000, image: 'banh.jpg' },
            { name: 'Kem', price: 30000, image: 'kem.jpg' },
            { name: 'Trà', price: 20000, image: 'tra.jpg' },
            { name: 'Cà phê', price: 25000, image: 'cafe.jpg' },
            
        ];
        renderMenuItems();
    }
    
    // Kiểm tra thông tin cài đặt bắt buộc
    function checkRequiredSettings() {
        if (!storeSettings) {
            showSettingsModal();
            return false;
        }
        
        // Kiểm tra các thông tin bắt buộc
        const requiredFields = {
            storeName: 'Tên cửa hàng',
            storeAddress: 'Địa chỉ cửa hàng',
            storePhone: 'Số điện thoại'
        };
        
        const missingFields = [];
        for (const [key, label] of Object.entries(requiredFields)) {
            if (!storeSettings[key] || storeSettings[key].trim() === '') {
                missingFields.push(label);
            }
        }
        
        if (missingFields.length > 0) {
            showSettingsModal(missingFields);
            return false;
        }
        
        return true;
    }
    
    // Hiển thị modal yêu cầu cài đặt
    function showSettingsModal(missingFields = []) {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-modal-content">
                <h2>Cài đặt thông tin cửa hàng</h2>
                <p>Vui lòng nhập thông tin cửa hàng để tiếp tục sử dụng hệ thống.</p>
                
                <div class="settings-form">
                    <div class="form-group">
                        <label for="modal-store-name">Tên cửa hàng:</label>
                        <input type="text" id="modal-store-name" placeholder="Nhập tên cửa hàng" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-store-phone">Số điện thoại:</label>
                        <input type="text" id="modal-store-phone" placeholder="Nhập số điện thoại" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-store-address">Địa chỉ:</label>
                        <input type="text" id="modal-store-address" placeholder="Nhập địa chỉ cửa hàng" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-excel-file">Tải lên file Excel món ăn:</label>
                        <input type="file" id="modal-excel-file" accept=".xlsx,.xls" required>
                        <p class="help-text">File Excel cần có 2 cột: Tên món và Giá</p>
                    </div>
                </div>
                
                <div class="settings-modal-actions">
                    <button id="modal-save-settings" class="btn-primary">Lưu và tiếp tục</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Thêm CSS cho modal
        const style = document.createElement('style');
        style.textContent = `
            .settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .settings-modal-content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .settings-modal-content h2 {
                margin-bottom: 15px;
                color: #333;
            }
            
            .settings-modal-content p {
                margin-bottom: 15px;
                color: #666;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .form-group input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .help-text {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            
            .settings-modal-actions {
                margin-top: 20px;
                text-align: center;
            }
            
            .btn-primary {
                padding: 10px 20px;
                background-color: #1890ff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .btn-primary:hover {
                background-color: #40a9ff;
            }
        `;
        
        document.head.appendChild(style);
        
        // Xử lý sự kiện lưu cài đặt
        const saveButton = document.getElementById('modal-save-settings');
        saveButton.addEventListener('click', function() {
            const storeName = document.getElementById('modal-store-name').value.trim();
            const storePhone = document.getElementById('modal-store-phone').value.trim();
            const storeAddress = document.getElementById('modal-store-address').value.trim();
            const excelFile = document.getElementById('modal-excel-file').files[0];
            
            if (!storeName || !storePhone || !storeAddress || !excelFile) {
                alert('Vui lòng điền đầy đủ thông tin và tải lên file Excel!');
                return;
            }
            
            // Lưu thông tin cửa hàng
            const settings = {
                storeName: storeName,
                storePhone: storePhone,
                storeAddress: storeAddress
            };
            localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
            
            // Xử lý file Excel
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Lấy sheet đầu tiên
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Chuyển đổi thành JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Giả sử dữ liệu Excel có định dạng: Tên món, Giá
                menuItems = jsonData.map(item => {
                    const name = item['Tên món'] || item['Tên'] || item['Món'] || Object.values(item)[0];
                    const price = item['Giá'] || item['Đơn giá'] || item['Giá tiền'] || Object.values(item)[1];
                    
                    return {
                        name: name,
                        price: parseFloat(price) || 0
                    };
                });
                
                // Lưu danh sách món
                saveMenuItems();
                
                // Đóng modal và cập nhật giao diện
                document.body.removeChild(modal);
                document.head.removeChild(style);
                renderMenuItems();
                alert('Đã lưu thông tin thành công!');
            };
            reader.readAsArrayBuffer(excelFile);
        });
    }
    
    // Khởi tạo ứng dụng với bố cục mới
    function initialize() {
        // Tải thông tin cửa hàng đã lưu
        loadStoreSettings();
        
        // Kiểm tra thông tin cài đặt bắt buộc
        if (!checkRequiredSettings()) {
            return; // Dừng khởi tạo nếu chưa có thông tin cài đặt
        }
        
        // Ẩn phần QR ban đầu
        if (qrPaymentSection) {
            qrPaymentSection.style.display = 'none';
        }
        
        // Thiết lập trạng thái ban đầu cho radio buttons và checkbox
        if (paymentCashRadio && paymentTransferRadio) {
            paymentCashRadio.checked = true;
            paymentTransferRadio.checked = false;
        }
        
        // Thiết lập trạng thái ban đầu cho checkbox QR
        if (showQrInBillCheckbox) {
            showQrInBillCheckbox.checked = false;
            
            // Kiểm tra nếu không có thông tin ngân hàng thì vô hiệu hóa checkbox
            if (!storeSettings || !storeSettings.bankAccount) {
                showQrInBillCheckbox.disabled = true;
                showQrInBillCheckbox.parentElement.title = 'Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt';
            }
        }
        
        // Thử tải dữ liệu từ localStorage trước
        const isDataLoaded = loadSavedMenuItems();
        
        // Nếu không có dữ liệu đã lưu, tạo dữ liệu mẫu
        if (!isDataLoaded) {
            createSampleMenuItems();
        }
        
        // Đảm bảo bố cục 2 cột hiển thị đúng
        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        
        if (leftColumn && rightColumn) {
            // Di chuyển danh sách món ăn vào cột trái nếu cần
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer && !leftColumn.contains(menuContainer)) {
                leftColumn.appendChild(menuContainer);
            }
            
            // Di chuyển thông tin hóa đơn vào cột phải nếu cần
            const billContainer = document.getElementById('bill-container');
            if (billContainer && !rightColumn.contains(billContainer)) {
                rightColumn.appendChild(billContainer);
            }
        }
    }
    
    // Bắt đầu ứng dụng
    initialize();

    // Thêm event listeners cho các trường giảm giá
    document.querySelectorAll('input[name="discount-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const unit = document.querySelector('#discount-unit');
            unit.textContent = radio.value === 'percentage' ? '%' : 'VND';
            // Reset giá trị giảm giá về 0 khi thay đổi hình thức
            document.querySelector('#discount-value').value = '0';
            calculateTotal();
        });
    });

    document.querySelector('#discount-value').addEventListener('input', calculateTotal);

    // Cập nhật event listeners cho các trường số lượng và giá
    document.querySelectorAll('.quantity, .price').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
}); 