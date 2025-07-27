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
    let currentTableNumber = '';
    let tableOrderStartTime = null; // Thời gian bắt đầu order cho bàn hiện tại
    let tableOrderData = {}; // Lưu trữ dữ liệu order theo bàn
    let allTableOrders = {}; // Lưu trữ tất cả order theo bàn
    let totalTables = 20; // Số lượng bàn mặc định

    // ==== DEFAULT STORE INFO ====
    const DEFAULT_STORE_SETTINGS = {
        storeName: 'Chú Gà Trống Tây Ninh',
        storeAddress: '486 Đường Điện Biên Phủ, Phường Ninh Phúc Ninh Thạnh, TP Tây Ninh',
        storePhone: '0976 768 787.',
        totalTables: 20
    };

    // Tải cài đặt số lượng bàn
    function loadTableSettings() {
        const savedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                totalTables = settings.totalTables || 20;
            } catch (e) {
                console.error('Lỗi khi tải cài đặt bàn:', e);
            }
        }
    }

    // Tải tất cả order theo bàn
    function loadAllTableOrders() {
        const savedOrders = localStorage.getItem('allTableOrders');
        if (savedOrders) {
            try {
                allTableOrders = JSON.parse(savedOrders);
            } catch (e) {
                console.error('Lỗi khi tải order theo bàn:', e);
                allTableOrders = {};
            }
        }
    }

    // Lưu tất cả order theo bàn
    function saveAllTableOrders() {
        localStorage.setItem('allTableOrders', JSON.stringify(allTableOrders));
    }

    // Lưu thời gian order theo bàn
    function saveTableOrderTime(tableNumber, startTime) {
        const tableData = JSON.parse(localStorage.getItem('tableOrderData') || '{}');
        tableData[tableNumber] = {
            startTime: startTime,
            items: []
        };
        localStorage.setItem('tableOrderData', JSON.stringify(tableData));
    }

    // Lấy thời gian order theo bàn
    function getTableOrderTime(tableNumber) {
        const tableData = JSON.parse(localStorage.getItem('tableOrderData') || '{}');
        return tableData[tableNumber] || null;
    }

    // Xóa dữ liệu order của bàn sau khi chốt bill
    function clearTableOrderData(tableNumber) {
        const tableData = JSON.parse(localStorage.getItem('tableOrderData') || '{}');
        delete tableData[tableNumber];
        localStorage.setItem('tableOrderData', JSON.stringify(tableData));
    }
    
    // On first load, set default store info if not present
    function ensureDefaultStoreSettings() {
        const savedSettings = localStorage.getItem(STORE_SETTINGS_KEY);
        if (!savedSettings) {
            localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
        }
    }
    
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
                Swal.fire({
                    icon: 'warning',
                    title: 'Thông báo',
                    text: 'Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt để hiển thị mã QR.',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#3085d6'
                });
            }
        });
    }
    
    // Theo dõi sự thay đổi checkbox hiển thị QR
    if (showQrInBillCheckbox) {
        showQrInBillCheckbox.addEventListener('change', function() {
            // Nếu checkbox được bật nhưng không có thông tin ngân hàng
            if (this.checked && (!storeSettings || !storeSettings.bankAccount)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thông báo',
                    text: 'Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt để hiển thị mã QR.',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#3085d6'
                });
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
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Vui lòng thiết lập thông tin tài khoản ngân hàng trong phần Cài đặt.',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#3085d6'
            });
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
            Toastify({
                text: "Đã xóa dữ liệu danh sách món ăn đã lưu!",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50",
                stopOnFocus: true
            }).showToast();
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
        // Nếu chưa có số bàn thì tự động chọn bàn trống đầu tiên
        if (!currentTableNumber) {
            autoSelectEmptyTable();
        }
        // Nếu đây là món đầu tiên của bàn, lưu thời gian bắt đầu order
        if (billItems.length === 0) {
            tableOrderStartTime = new Date();
            saveTableOrderTime(currentTableNumber, tableOrderStartTime.toISOString());
        }
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
        
        // Lưu order hiện tại vào bàn
        saveCurrentTableOrder();
        renderBillItems();
        calculateTotal();
        updateTableList();
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
            saveCurrentTableOrder();
            renderBillItems();
            calculateTotal();
            updateTableList();
        } else {
            removeItem(index);
        }
    }
    
    // Tăng số lượng món trong hóa đơn
    function increaseQuantity(index) {
        billItems[index].quantity += 1;
        billItems[index].total = billItems[index].price * billItems[index].quantity;
        saveCurrentTableOrder();
        renderBillItems();
        calculateTotal();
        updateTableList();
    }
    
    // Xóa món khỏi hóa đơn
    function removeItem(index) {
        billItems.splice(index, 1);
        saveCurrentTableOrder();
        renderBillItems();
        calculateTotal();
        updateTableList();
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
        showBillConfirmation();
    });
    
    // Thêm hàm gửi dữ liệu hóa đơn lên Google Sheets
    function saveInvoiceToGoogleSheet(invoiceData) {
        fetch('https://script.google.com/macros/s/AKfycbzpvbol6yaJo1BFwSi4QK-0TbHypr54XVLnd3Csxvm-sFKggVuSFqvra7iwtz2Jf4J8/exec', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    // Hàm in hóa đơn
    // Hiển thị popup xác nhận hóa đơn trước khi in
    function showBillConfirmation() {
        if (billItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Chưa có món ăn nào trong hóa đơn',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Tính tổng tiền và giảm giá
        let subtotal = 0;
        billItems.forEach(item => {
            subtotal += item.total;
        });
        
        const discountType = document.querySelector('input[name="discount-type"]:checked').value;
        const discountValue = parseFloat(document.querySelector('#discount-value').value) || 0;
        let discountAmount = 0;
        
        if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100);
        } else {
            discountAmount = discountValue;
        }
        
        const total = subtotal - discountAmount;

        // Lấy thông tin thời gian
        const now = new Date();
        const dateString = now.toLocaleDateString('vi-VN');
        const timeString = now.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});

        // Tạo HTML cho thông tin hóa đơn
        let billInfoHTML = '';
        if (currentTableNumber) {
            billInfoHTML += `<div class="bill-info-row"><strong>Bàn:</strong> ${currentTableNumber}</div>`;
        }
        billInfoHTML += `
            <div class="bill-info-row"><strong>Ngày:</strong> ${dateString}</div>
            <div class="bill-info-row"><strong>Giờ:</strong> ${timeString}</div>
            <div class="bill-info-row"><strong>Số món:</strong> ${billItems.length}</div>
        `;

        // Tạo HTML cho danh sách món ăn
        let billItemsHTML = '';
        billItems.forEach((item, index) => {
            billItemsHTML += `
                <div class="bill-item-row">
                    <div class="bill-item-name">${index + 1}. ${item.name}</div>
                    <div class="bill-item-details">
                        <span class="bill-item-price">${formatCurrency(item.price)}</span>
                        <span class="bill-item-quantity">x ${item.quantity}</span>
                        <span class="bill-item-total">${formatCurrency(item.total)}</span>
                    </div>
                </div>
            `;
        });

        // Tạo HTML cho thông tin tổng kết
        let summaryHTML = '';
        if (discountAmount > 0) {
            summaryHTML = `
                <div class="bill-summary-row">
                    <span>Tiền hàng:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="bill-summary-row discount">
                    <span>Giảm giá (${discountType === 'percentage' ? discountValue + '%' : formatCurrency(discountValue)}):</span>
                    <span>-${formatCurrency(discountAmount)}</span>
                </div>
            `;
        }

        Swal.fire({
            title: `Xác nhận hóa đơn${currentTableNumber ? ` - Bàn ${currentTableNumber}` : ''}`,
            html: `
                <div class="bill-confirmation">
                    <div class="bill-info">
                        ${billInfoHTML}
                    </div>
                    <div class="bill-items-list">
                        ${billItemsHTML}
                    </div>
                    <div class="bill-summary">
                        ${summaryHTML}
                        <div class="bill-summary-row total">
                            <span><strong>Tổng tiền:</strong></span>
                            <span><strong>${formatCurrency(total)}</strong></span>
                        </div>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'In hóa đơn',
            cancelButtonText: 'Hủy',
            width: '650px',
            heightAuto: true,
            customClass: {
                popup: 'bill-confirmation-popup',
                content: 'bill-confirmation-content'
            },
            allowEscapeKey: true,
            allowOutsideClick: false,
            showCloseButton: true,
            focusConfirm: false,
            preConfirm: () => {
                return true;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Hiển thị loading
                Swal.fire({
                    title: 'Đang xử lý...',
                    text: 'Vui lòng chờ trong giây lát',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Thực hiện in sau 500ms để hiển thị loading
                setTimeout(() => {
                    Swal.close();
                    printInvoice();
                }, 500);
            }
        });
    }

    function printInvoice() {
        
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
                    .invoice-header .date-table {
                        display: flex;
                        flex-direction: row;
                        gap: 16px;
                        align-items: center;
                    }
                    .invoice-header .table-number-print {
                        font-size: 15px;
                        font-weight: bold;
                        color: #d2691e;
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
                                <div class="date-table text-right">
                                    <div>
                                        <b>Ngày:</b> ${dateString} ${timeString} ${currentTableNumber ? `<div class="table-number-print"><b>Số bàn:</b> ${currentTableNumber}</div>` : ''}
                                    </div>
                                   
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
                
                // Gửi dữ liệu hóa đơn lên Google Sheets
                try {
                    const now = new Date();
                    const orderStartTime = tableOrderStartTime || now;
                    const orderDuration = Math.round((now - orderStartTime) / 1000 / 60); // Thời gian order tính bằng phút
                    const invoiceData = {
                        date: dateString,
                        time: timeString,
                        year: now.getFullYear(),
                        month: now.getMonth() + 1,
                        tableNumber: currentTableNumber,
                        total: total,
                        orderStartTime: orderStartTime.toISOString(),
                        orderEndTime: now.toISOString(),
                        orderDuration: orderDuration, // Thời gian order (phút)
                        items: billItems
                    };
                    saveInvoiceToGoogleSheet(invoiceData);
                                    // Xóa dữ liệu order của bàn sau khi chốt bill
                clearTableOrderData(currentTableNumber);
                // Xóa khỏi allTableOrders
                delete allTableOrders[currentTableNumber];
                saveAllTableOrders();
            } catch (err) { console.error('Lỗi gửi dữ liệu Google Sheets:', err); }
            // Cập nhật hiển thị và chọn bàn trống đầu tiên
            setTimeout(function() {
                updateTableList();
                autoSelectEmptyTable();
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
            // Cập nhật hiển thị danh sách bàn
            updateTableList();
            
            // Hiển thị thông báo thành công
            Toastify({
                text: "In hóa đơn thành công!",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50",
                stopOnFocus: true
            }).showToast();
        }, 1000);
    }
    
    // Hàm xóa hóa đơn
    function clearBill() {
        // Xác nhận trước khi xóa
        if (billItems.length > 0) {
            const confirmMessage = currentTableNumber ? 
                `Bạn có chắc muốn xóa hóa đơn của bàn ${currentTableNumber}?` : 
                'Bạn có chắc muốn xóa hóa đơn hiện tại?';
            
            Swal.fire({
                title: 'Xác nhận xóa hóa đơn',
                text: confirmMessage,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    performClearBill();
                }
            });
            return;
        }
        
        // Nếu không có món ăn nào, xóa trực tiếp
        performClearBill();
    }
    
    // Hàm thực hiện xóa hóa đơn
    function performClearBill() {
        
        // Xóa order của bàn hiện tại khỏi allTableOrders
        if (currentTableNumber && allTableOrders[currentTableNumber]) {
            delete allTableOrders[currentTableNumber];
            saveAllTableOrders();
        }
        
        // Reset dữ liệu hóa đơn
        billItems = [];
        renderBillItems();
        calculateTotal();
        
        // Reset các trường input
        if (customerNameInput) customerNameInput.value = '';
        if (tableNumberInput) tableNumberInput.value = '';
        
        // Reset thời gian order
        tableOrderStartTime = null;
        
        // Reset giá trị giảm giá về 0
        document.querySelector('#discount-value').value = '0';
        calculateTotal();
        
        // Xóa số bàn hiện tại
        currentTableNumber = '';
        
        // Tự động chọn bàn trống đầu tiên
        autoSelectEmptyTable();
        
        // Cập nhật hiển thị
        updateTableNumberDisplay();
        updateTableList();
        
        // Thông báo xóa thành công
        if (billItems.length === 0) {
            setTimeout(() => {
                Toastify({
                    text: "Đã xóa hóa đơn thành công!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#4CAF50",
                    stopOnFocus: true
                }).showToast();
            }, 100);
        }
    }
    
    // Sự kiện xóa hóa đơn
    clearBillButton.addEventListener('click', function() {
        // Hiển thị loading nếu có món ăn trong hóa đơn
        if (billItems.length > 0) {
            Swal.fire({
                title: 'Đang xử lý...',
                text: 'Vui lòng chờ trong giây lát',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Thực hiện xóa sau 300ms để hiển thị loading
            setTimeout(() => {
                Swal.close();
                clearBill();
            }, 300);
        } else {
            clearBill();
        }
    });
    
    // Tạo một số món ăn mẫu để hiển thị khi không có file Excel
    function createMenuItems() {
        menuItems = [
            { name: 'Cá Tầm Nướng Y', price: 170000, image: 'default.jpg' },
            { name: 'Cá Tầm Nướng Muối Ớt', price: 170000, image: 'default.jpg' },
            { name: 'Cá Tai Tượng Chiên Xù', price: 190000, image: 'default.jpg' },
            { name: 'Cá Tầm Cháy Tiêu Xanh', price: 200000, image: 'default.jpg' },
            { name: 'Tôm Nướng Muối Ớt', price: 160000, image: 'default.jpg' },
            { name: 'Tôm Nướng Y', price: 160000, image: 'default.jpg' },
            { name: 'Tôm Rang Muối HongKong', price: 160000, image: 'default.jpg' },
            { name: 'Tôm Hấp Nước Dừa', price: 160000, image: 'default.jpg' },
            { name: 'Tôm Sốt Thái', price: 170000, image: 'default.jpg' },
            { name: 'Tôm Sống Wasabi', price: 160000, image: 'default.jpg' },
            { name: 'Tôm Sốt Trứng Muối', price: 170000, image: 'default.jpg' },
            { name: 'Ốc Hương Sốt Trứng Muối', price: 220000, image: 'default.jpg' },
            { name: 'Ốc Hương Rang Muối Ớt', price: 210000, image: 'default.jpg' },
            { name: 'Ốc Hương Sốt Bơ Cay', price: 210000, image: 'default.jpg' },
            { name: 'Ốc Hương Hấp Sả', price: 210000, image: 'default.jpg' },
            { name: 'Ốc Lác Nướng Tiêu Xanh', price: 90000, image: 'default.jpg' },
            { name: 'Ốc Lác Hấp Sả', price: 90000, image: 'default.jpg' },
            { name: 'Ốc Lác Hấp Thái', price: 90000, image: 'default.jpg' },
            { name: 'Lẩu Cua Đồng Hải Sản', price: 210000, image: 'default.jpg' },
            { name: 'Lẩu Cá Tầm Chua Cay', price: 250000, image: 'default.jpg' },
            { name: 'Lẩu Thái Thập Cẩm', price: 210000, image: 'default.jpg' },
            { name: 'Lẩu Hải Sản Chua Cay', price: 200000, image: 'default.jpg' },
            { name: 'Lẩu Cua Đồng Thác Lác', price: 210000, image: 'default.jpg' },
            { name: 'Lẩu Cá Bông Lau', price: 180000, image: 'default.jpg' },
    
            { name: 'Bò Nướng BBQ', price: 180000, image: 'default.jpg' },
            { name: 'Bò Nhúng Giấm', price: 170000, image: 'default.jpg' },
            { name: 'Bò Nướng Y', price: 150000, image: 'default.jpg' },
            { name: 'Bò Lui Sả', price: 150000, image: 'default.jpg' },
            { name: 'Bò Cuộn Cải Bẹ Xanh', price: 150000, image: 'default.jpg' },
            { name: 'Bò Lúc Lắc', price: 150000, image: 'default.jpg' },
            { name: 'Bò Bóp Thấu', price: 150000, image: 'default.jpg' },
            { name: 'Bò Cuộn Mỡ Chày', price: 210000, image: 'default.jpg' },
    
            { name: 'Giò Heo Muối Chiên Giòn', price: 200000, image: 'default.jpg' },
            { name: 'Vú Heo Nướng Sa Tế', price: 150000, image: 'default.jpg' },
            { name: 'Vú Heo Chiên Nước Mắm', price: 150000, image: 'default.jpg' },
            { name: 'Vú Heo Chiên Giòn', price: 150000, image: 'default.jpg' },
            { name: 'Thịt Luộc Mắm Chua', price: 150000, image: 'default.jpg' },
            { name: 'Heo Sữa Quay Phần', price: 450000, image: 'default.jpg' },
            { name: 'Vú Heo Nướng Muối Ớt', price: 150000, image: 'default.jpg' },
    
            { name: 'Ếch Cháy Tỏi', price: 100000, image: 'default.jpg' },
            { name: 'Ếch Núp Lùm', price: 100000, image: 'default.jpg' },
            { name: 'Ếch Nướng Muối Ớt', price: 100000, image: 'default.jpg' },
            { name: 'Ếch Chiên Nước Mắm', price: 100000, image: 'default.jpg' },
            { name: 'Ếch Xào Lá Giang', price: 100000, image: 'default.jpg' },
            { name: 'Ếch Chiên Bơ', price: 100000, image: 'default.jpg' },
    
            { name: 'Heo Sữa Quay', price: 450000, image: 'default.jpg' },
            { name: 'Sườn Tảng Quay Lu', price: 350000, image: 'default.jpg' },
            { name: 'Gà Ta Nướng Muối Ớt Xôi Chiên', price: 350000, image: 'default.jpg' },
            { name: 'Gà Ta Quay Lu Bánh Bao', price: 350000, image: 'default.jpg' },
            { name: 'Chả Giò Gà Trống', price: 120000, image: 'default.jpg' },
            { name: 'Cá Thác Lác Chiên Giòn', price: 160000, image: 'default.jpg' },
            { name: 'Thác Lác Hấp Cải Bẹ Xanh', price: 170000, image: 'default.jpg' },
            { name: 'Lẩu Cua Đồng Thác Lác', price: 210000, image: 'default.jpg' },
            { name: 'Gỏi Tép', price: 130000, image: 'default.jpg' },
            { name: 'Tép Um Cuốn Bánh Tráng', price: 150000, image: 'default.jpg' },
            { name: 'Heo Sữa Quay Nguyên Con', price: 2000000, image: 'default.jpg' }
        ];
    
        renderMenuItems();
    }
    
    // Hiển thị modal chọn bàn
    function showTableSelectionModal() {
        if (document.getElementById('table-selection-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'table-selection-modal';
        modal.className = 'settings-modal';
        
        // Tạo danh sách bàn
        let tableButtons = '';
        for (let i = 1; i <= totalTables; i++) {
            const hasOrder = allTableOrders[i] && allTableOrders[i].items && allTableOrders[i].items.length > 0;
            const orderCount = hasOrder ? allTableOrders[i].items.length : 0;
            const orderTotal = hasOrder ? allTableOrders[i].items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
            
            tableButtons += `
                <div class="table-button ${hasOrder ? 'has-order' : ''}" data-table="${i}">
                    <div class="table-number">Bàn ${i}</div>
                    ${hasOrder ? `
                        <div class="table-info">
                            <div class="order-count">${orderCount} món</div>
                            <div class="order-total">${formatCurrency(orderTotal)}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="settings-modal-content">
                <h2>Chọn bàn</h2>
                <div class="table-grid">
                    ${tableButtons}
                </div>
                <div class="settings-modal-actions">
                    <button id="modal-cancel-table" class="btn-secondary">Hủy</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Thêm CSS cho modal chọn bàn
        if (!document.getElementById('table-selection-style')) {
            const style = document.createElement('style');
            style.id = 'table-selection-style';
            style.textContent = `
                .table-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 10px;
                    margin: 20px 0;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .table-button {
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: white;
                }
                .table-button:hover {
                    border-color: #1890ff;
                    background: #f0f8ff;
                }
                .table-button.has-order {
                    border-color: #52c41a;
                    background: #f6ffed;
                }
                .table-button.has-order:hover {
                    border-color: #389e0d;
                    background: #e6f7ff;
                }
                .table-number {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                .table-info {
                    font-size: 12px;
                    color: #666;
                }
                .order-count {
                    color: #52c41a;
                    font-weight: bold;
                }
                .order-total {
                    color: #1890ff;
                    font-weight: bold;
                }
                .btn-secondary {
                    padding: 10px 20px;
                    background-color: #f5f5f5;
                    color: #333;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                    margin-left: 10px;
                }
                .btn-secondary:hover {
                    background-color: #e6e6e6;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Sự kiện chọn bàn
        document.querySelectorAll('.table-button').forEach(button => {
            button.addEventListener('click', function() {
                const tableNumber = this.getAttribute('data-table');
                selectTable(tableNumber);
                document.body.removeChild(modal);
            });
        });
        
        // Sự kiện hủy
        document.getElementById('modal-cancel-table').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    }

    // Chọn bàn và tải order của bàn đó
    function selectTable(tableNumber) {
        currentTableNumber = tableNumber;
        if (tableNumberInput) tableNumberInput.value = tableNumber;
        
        // Tải order của bàn này
        if (allTableOrders[tableNumber]) {
            billItems = [...allTableOrders[tableNumber].items];
            tableOrderStartTime = new Date(allTableOrders[tableNumber].startTime);
        } else {
            billItems = [];
            tableOrderStartTime = null;
        }
        
        renderBillItems();
        calculateTotal();
        updateTableNumberDisplay();
        updateTableList();
    }

    // Lưu order hiện tại vào bàn
    function saveCurrentTableOrder() {
        if (currentTableNumber && billItems.length > 0) {
            allTableOrders[currentTableNumber] = {
                startTime: tableOrderStartTime ? tableOrderStartTime.toISOString() : new Date().toISOString(),
                items: [...billItems]
            };
            saveAllTableOrders();
        } else if (currentTableNumber && billItems.length === 0) {
            // Xóa order nếu bàn không còn món nào
            delete allTableOrders[currentTableNumber];
            saveAllTableOrders();
        }
    }
    
    // Hiển thị modal nhập số bàn
    function showTableNumberModal() {
        // Thay thế bằng modal chọn bàn
        showTableSelectionModal();
        return;
        // Đảm bảo CSS modal luôn có trên trang
        if (!document.getElementById('modal-style')) {
            const style = document.createElement('style');
            style.id = 'modal-style';
            style.textContent = `
                .settings-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .settings-modal-content {
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
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
                    font-size: 16px;
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
                    font-size: 16px;
                }
                .btn-primary:hover {
                    background-color: #40a9ff;
                }
                #current-table-number-display {
                      display: block;
                        font-size: 40px;
                        font-weight: bold;
                        color: #d2691e; 
                }
            `;
            document.head.appendChild(style);
        }
        // Focus input
        setTimeout(() => {
            document.getElementById('modal-table-number').focus();
        }, 100);
        // Sự kiện xác nhận
        document.getElementById('modal-save-table-number').addEventListener('click', function() {
            const value = document.getElementById('modal-table-number').value.trim();
            if (!value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thông báo',
                    text: 'Vui lòng nhập số bàn!',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            currentTableNumber = value;
            if (tableNumberInput) tableNumberInput.value = value;
            // Kiểm tra xem bàn này đã có order trước đó chưa
            const existingOrder = getTableOrderTime(currentTableNumber);
            if (existingOrder) {
                tableOrderStartTime = new Date(existingOrder.startTime);
            } else {
                tableOrderStartTime = null;
            }
            updateTableNumberDisplay();
            document.body.removeChild(modal);
        });
        // Cho phép nhấn Enter để xác nhận
        document.getElementById('modal-table-number').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('modal-save-table-number').click();
            }
        });
    }

    // Hiển thị số bàn trên màn hình chính
    function updateTableNumberDisplay() {
        let display = document.getElementById('current-table-number-display');
        if (!display) {
            // Thêm vào đầu bill-container nếu có, hoặc body nếu không
            const billContainer = document.getElementById('bill-container') || document.body;
            display = document.createElement('div');
            display.id = 'current-table-number-display';
            if (billContainer.firstChild) {
                billContainer.insertBefore(display, billContainer.firstChild);
            } else {
                billContainer.appendChild(display);
            }
        }
        if (currentTableNumber) {
            const hasOrder = allTableOrders[currentTableNumber] && allTableOrders[currentTableNumber].items && allTableOrders[currentTableNumber].items.length > 0;
            const orderCount = hasOrder ? allTableOrders[currentTableNumber].items.length : 0;
            const orderTotal = hasOrder ? allTableOrders[currentTableNumber].items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
            
            display.innerHTML = `
                <div class="table-display">
                    <div class="table-number">Bàn ${currentTableNumber}</div>
                    ${hasOrder ? `
                        <div class="table-order-info">
                            <span class="order-count">${orderCount} món</span>
                            <span class="order-total">${formatCurrency(orderTotal)}</span>
                        </div>
                    ` : '<div class="table-order-info"><span class="order-count">Trống</span></div>'}
                </div>
            `;
        } else {
            display.textContent = '';
        }
    }
    
    // Hiển thị danh sách bàn
    function renderTableList() {
        const tableListGrid = document.getElementById('table-list-grid');
        if (!tableListGrid) return;
        
        tableListGrid.innerHTML = '';
        
        for (let i = 1; i <= totalTables; i++) {
            const hasOrder = allTableOrders[i] && allTableOrders[i].items && allTableOrders[i].items.length > 0;
            const orderCount = hasOrder ? allTableOrders[i].items.length : 0;
            const orderTotal = hasOrder ? allTableOrders[i].items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
            const isCurrentTable = currentTableNumber === i.toString();
            
            const tableItem = document.createElement('div');
            tableItem.className = `table-list-item ${hasOrder ? 'has-order' : ''} ${isCurrentTable ? 'current-table' : ''}`;
            tableItem.setAttribute('data-table', i);
            
            tableItem.innerHTML = `
                <div class="table-list-number">Bàn ${i}</div>
                ${hasOrder ? `
                    <div class="table-list-info">
                        <div class="table-list-count">${orderCount} món</div>
                        <div class="table-list-total">${formatCurrency(orderTotal)}</div>
                        <button class="table-clear-btn" data-table="${i}" title="Xóa hóa đơn bàn ${i}">🗑️</button>
                    </div>
                ` : `
                    <div class="table-list-empty">Trống</div>
                `}
            `;
            
            tableItem.addEventListener('click', function(e) {
                // Không chọn bàn nếu click vào nút xóa
                if (e.target.classList.contains('table-clear-btn')) {
                    e.stopPropagation();
                    clearTableBill(i.toString());
                    return;
                }
                selectTable(i.toString());
            });
            
            tableListGrid.appendChild(tableItem);
        }
    }
    
    // Tự động chọn bàn trống đầu tiên
    function autoSelectEmptyTable() {
        for (let i = 1; i <= totalTables; i++) {
            const hasOrder = allTableOrders[i] && allTableOrders[i].items && allTableOrders[i].items.length > 0;
            if (!hasOrder) {
                selectTable(i.toString());
                return;
            }
        }
        // Nếu không có bàn trống, chọn bàn đầu tiên hoặc để trống
        if (totalTables > 0) {
            selectTable('1');
        } else {
            currentTableNumber = '';
            updateTableNumberDisplay();
        }
    }
    
    // Cập nhật hiển thị danh sách bàn
    function updateTableList() {
        renderTableList();
    }
    
    // Xóa hóa đơn của bàn cụ thể
    function clearTableBill(tableNumber) {
        if (!tableNumber) return;
        
        const confirmMessage = `Bạn có chắc muốn xóa hóa đơn của bàn ${tableNumber}?`;
        Swal.fire({
            title: 'Xác nhận xóa hóa đơn',
            text: confirmMessage,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                performClearTableBill(tableNumber);
            }
        });
    }
    
    // Hàm thực hiện xóa hóa đơn bàn
    function performClearTableBill(tableNumber) {
        
        // Xóa order của bàn khỏi allTableOrders
        if (allTableOrders[tableNumber]) {
            delete allTableOrders[tableNumber];
            saveAllTableOrders();
        }
        
        // Xóa dữ liệu order của bàn
        clearTableOrderData(tableNumber);
        
        // Nếu đang chọn bàn này, reset hóa đơn hiện tại
        if (currentTableNumber === tableNumber) {
            billItems = [];
            renderBillItems();
            calculateTotal();
            tableOrderStartTime = null;
            currentTableNumber = '';
            autoSelectEmptyTable();
        }
        
        // Cập nhật hiển thị
        updateTableNumberDisplay();
        updateTableList();
        
        // Thông báo xóa thành công
        setTimeout(() => {
            Toastify({
                text: `Đã xóa hóa đơn bàn ${tableNumber} thành công!`,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50",
                stopOnFocus: true
            }).showToast();
        }, 100);
    }
    
    // Khởi tạo ứng dụng với bố cục mới
    function initialize() {
        // Đảm bảo có thông tin mặc định
        ensureDefaultStoreSettings();
        // Tải thông tin cửa hàng đã lưu
        loadStoreSettings();
        // Tải cài đặt bàn
        loadTableSettings();
        // Tải tất cả order theo bàn
        loadAllTableOrders();
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
            createMenuItems();
        }
        // Hiển thị danh sách bàn
        renderTableList();
        // Tự động chọn bàn trống đầu tiên
        autoSelectEmptyTable();
        // Thêm sự kiện cho nút refresh
        const refreshButton = document.getElementById('refresh-tables');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                updateTableList();
            });
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