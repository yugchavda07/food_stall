// Get cart data from localStorage
let cart = [];
let selectedPaymentMethod = 'card'; // Default payment method

document.addEventListener('DOMContentLoaded', function() {
    // Load cart data
    const cartData = localStorage.getItem('cart');
    if (cartData) {
        cart = JSON.parse(cartData);
    } else {
        // Redirect to home if cart is empty
        window.location.href = 'home.html';
        return;
    }

    // Display order items and calculate totals
    displayOrderSummary();
    
    // Set up payment method selection
    setupPaymentMethodSelection();
    
    // Format card inputs
    setupCardInputFormatting();
    
    // Generate UPI QR code
    generateUpiQrCode();
});

function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    // Update summary amounts
    subtotalElement.textContent = `₹${subtotal}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total}`;
    
    // Display order items
    orderItems.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        
        itemElement.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name} ${item.variation ? `(${item.variation.name})` : ''}</div>
                <div class="item-quantity">x${item.quantity}</div>
            </div>
            <div class="item-price">₹${item.finalPrice * item.quantity}</div>
        `;
        
        orderItems.appendChild(itemElement);
    });
}

function generateUpiQrCode() {
    const upiQrCode = document.getElementById('upiQrCode');
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    // Create UPI payment URL
    // Format: upi://pay?pa=PAYEE_VPA&pn=PAYEE_NAME&am=AMOUNT&cu=CURRENCY
    const upiPaymentUrl = `upi://pay?pa=foodstall@upi&pn=FoodStall&am=${total.toFixed(2)}&cu=INR`;
    
    // Generate QR code using a free QR code API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPaymentUrl)}`;
    
    // Set the QR code image
    upiQrCode.innerHTML = `<img src="${qrCodeUrl}" alt="UPI QR Code">`;
}

function setupPaymentMethodSelection() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardDetails = document.getElementById('cardDetails');
    const upiDetails = document.getElementById('upiDetails');
    const cashDetails = document.getElementById('cashDetails');
    
    // Set default payment method
    paymentOptions[0].classList.add('selected');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Get payment method from onclick attribute
            const onclickAttr = this.getAttribute('onclick');
            const methodMatch = onclickAttr.match(/'([^']+)'/);
            
            if (methodMatch && methodMatch[1]) {
                selectedPaymentMethod = methodMatch[1];
                
                // Show/hide appropriate payment details
                cardDetails.style.display = selectedPaymentMethod === 'card' ? 'block' : 'none';
                upiDetails.style.display = selectedPaymentMethod === 'upi' ? 'block' : 'none';
                cashDetails.style.display = selectedPaymentMethod === 'cash' ? 'block' : 'none';
            }
        });
    });
}

function setupCardInputFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    
    // Format card number with spaces
    cardNumber.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        this.value = formattedValue;
    });
    
    // Format expiry date as MM/YY
    expiryDate.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            this.value = value;
        }
    });
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI to show selected payment method
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        const onclickAttr = option.getAttribute('onclick');
        if (onclickAttr.includes(`'${method}'`)) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Show/hide appropriate payment details
    document.getElementById('cardDetails').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('upiDetails').style.display = method === 'upi' ? 'block' : 'none';
    document.getElementById('cashDetails').style.display = method === 'cash' ? 'block' : 'none';
    
    // Regenerate QR code if UPI is selected
    if (method === 'upi') {
        generateUpiQrCode();
    }
}

function processPayment() {
    // Validate payment method specific fields
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            alert('Please fill in all card details');
            return;
        }
    } else if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value;
        
        if (!upiId) {
            alert('Please enter your UPI ID');
            return;
        }
    }
    
    // Calculate order total
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    // Create order object
    const order = {
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        paymentMethod: selectedPaymentMethod,
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // In a real app, you would send this to a server
    console.log('Order placed:', order);
    
    // Store in localStorage for demo purposes
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show success message and redirect
    let successMessage = 'Order placed successfully!';
    if (selectedPaymentMethod === 'cash') {
        successMessage = 'Order placed successfully! Please pay at the counter when collecting your order.';
    }
    
    alert(successMessage);
    window.location.href = 'home.html';
} 