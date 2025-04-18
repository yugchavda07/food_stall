// Initialize cart and menu items
let cart = [];
let menuItems = [];

// Fetch menu items when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Load menu items from localStorage (shared with admin page)
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
        menuItems = JSON.parse(savedMenuItems);
    } else {
        // Fallback to sample data if no items in localStorage
        menuItems = [
            {
                id: 1,
                name: "Butter Chicken",
                category: "main",
                price: 350,
                description: "Tender chicken in rich tomato gravy",
                image: "https://via.placeholder.com/300x200",
                status: "available",
                variations: [
                    { name: "Half", price: 200 },
                    { name: "Full", price: 350 }
                ],
                tags: ["spicy", "popular"],
                preparationTime: 20,
                calories: 450,
                dietary: {
                    vegetarian: false,
                    vegan: false,
                    glutenFree: true
                }
            },
            {
                id: 2,
                name: "Masala Dosa",
                category: "starters",
                price: 120,
                description: "Crispy dosa with spiced potato filling",
                image: "https://via.placeholder.com/300x200",
                status: "available",
                variations: [
                    { name: "Plain", price: 100 },
                    { name: "Masala", price: 120 }
                ],
                tags: ["vegetarian", "popular"],
                preparationTime: 15,
                calories: 300,
                dietary: {
                    vegetarian: true,
                    vegan: true,
                    glutenFree: false
                }
            },
            {
                id: 3,
                name: "Mango Lassi",
                category: "beverages",
                price: 80,
                description: "Fresh mango yogurt smoothie",
                image: "https://via.placeholder.com/300x200",
                status: "available",
                variations: [
                    { name: "Regular", price: 80 },
                    { name: "Large", price: 120 }
                ],
                tags: ["sweet", "refreshing"],
                preparationTime: 5,
                calories: 150,
                dietary: {
                    vegetarian: true,
                    vegan: false,
                    glutenFree: true
                }
            }
        ];
        // Save sample data to localStorage
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
    
    renderMenuItems();
    setupEventListeners();

    // Listen for menu updates from admin page
    window.addEventListener('storage', function(e) {
        if (e.key === 'menuItems') {
            menuItems = JSON.parse(e.newValue);
            renderMenuItems();
            
            // Update cart if items in cart are now unavailable
            updateCartAfterMenuChange();
        }
    });
});

let selectedPaymentMethod = '';

function renderMenuItems(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);

    filteredItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        
        // Check if item is available
        const isAvailable = item.status === 'available';
        
        // Apply grayscale filter if item is unavailable
        if (!isAvailable) {
            div.style.filter = 'grayscale(100%)';
            div.style.opacity = '0.7';
        }
        
        let variationsHtml = '';
        if (item.variations && item.variations.length > 0) {
            variationsHtml = `
                <select class="variations-select" onchange="updateItemPrice(this, ${item.id})" ${!isAvailable ? 'disabled' : ''}>
                    ${item.variations.map(v => 
                        `<option value="${v.name}" data-price="${v.price}">${v.name} - ₹${v.price}</option>`
                    ).join('')}
                </select>
            `;
        }

        let tagsHtml = '';
        if (item.tags && item.tags.length > 0) {
            tagsHtml = `
                <div class="item-tags" style="margin-bottom: 0.5rem; font-size: 0.8rem; color: #64748b;">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(' • ')}
                </div>
            `;
        }

        let dietaryHtml = '';
        if (item.dietary) {
            const dietaryInfo = [];
            if (item.dietary.vegetarian) dietaryInfo.push('Vegetarian');
            if (item.dietary.vegan) dietaryInfo.push('Vegan');
            if (item.dietary.glutenFree) dietaryInfo.push('Gluten-Free');
            if (dietaryInfo.length > 0) {
                dietaryHtml = `
                    <div class="dietary-info" style="margin-bottom: 0.5rem; font-size: 0.8rem; color: #059669;">
                        ${dietaryInfo.join(' • ')}
                    </div>
                `;
            }
        }

        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <div class="menu-item-name">${item.name}</div>
                ${tagsHtml}
                ${dietaryHtml}
                <div class="menu-item-description">${item.description}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">
                    Prep time: ${item.preparationTime} mins • ${item.calories} cal
                </div>
                ${variationsHtml}
                <div class="menu-item-price">₹${item.variations && item.variations.length > 0 ? item.variations[0].price : item.price}</div>
                <button class="add-to-cart" onclick="addToCart(${item.id}, this.parentElement)" ${!isAvailable ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>
                    ${isAvailable ? 'Add to Cart' : 'Unavailable'}
                </button>
            </div>
        `;
        menuGrid.appendChild(div);
    });
}

function updateItemPrice(select, itemId) {
    const price = select.options[select.selectedIndex].dataset.price;
    const priceElement = select.parentElement.querySelector('.menu-item-price');
    priceElement.textContent = `₹${price}`;
}

function addToCart(itemId, container) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item || item.status !== 'available') return;

    // Get selected variation
    const variationSelect = container.querySelector('.variations-select');
    const selectedVariationName = variationSelect ? variationSelect.value : null;
    const selectedVariation = item.variations && item.variations.length > 0 ? 
        item.variations.find(v => v.name === selectedVariationName) : 
        null;

    const cartItem = {
        ...item,
        quantity: 1,
        variation: selectedVariation,
        finalPrice: selectedVariation ? selectedVariation.price : item.price
    };

    // Check if identical item exists in cart
    const existingItemIndex = cart.findIndex(i => 
        i.id === cartItem.id && 
        i.variation?.name === cartItem.variation?.name
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    updateCartUI();
    
    // Find the parent menu-item div
    const menuItem = container.closest('.menu-item');
    
    // Create a unique ID for this variation
    const variationId = `item-${itemId}-${selectedVariationName || 'default'}`;
    
    // Check if this specific variation already has a summary
    let existingSummary = menuItem.querySelector(`#${variationId}`);
    
    if (existingSummary) {
        // Update the quantity in the existing summary
        const quantitySpan = existingSummary.querySelector('.summary-quantity span');
        const currentItem = cart.find(i => 
            i.id === item.id && 
            i.variation?.name === selectedVariationName
        );
        quantitySpan.textContent = currentItem.quantity;
    } else {
        // Create a new summary line for this variation
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'item-summary';
        summaryDiv.id = variationId;
        
        // Get the current quantity from cart
        const currentItem = cart.find(i => 
            i.id === item.id && 
            i.variation?.name === selectedVariationName
        );
        
        const itemPrice = selectedVariation ? selectedVariation.price : item.price;
        
        // Format the display text based on whether there's a variation
        let displayText;
        if (selectedVariation) {
            displayText = `<span class="variation-badge">${selectedVariation.name}</span>`;
        } else {
            displayText = `<span class="added-badge">Added</span>`;
        }
        
        summaryDiv.innerHTML = `
            <div class="summary-name">${displayText}</div>
            <div class="summary-price">₹${itemPrice}</div>
            <div class="summary-quantity">
                <button class="quantity-btn small" onclick="updateItemQuantity(${item.id}, '${selectedVariationName || ''}', -1, this)">-</button>
                <span>${currentItem.quantity}</span>
                <button class="quantity-btn small" onclick="updateItemQuantity(${item.id}, '${selectedVariationName || ''}', 1, this)">+</button>
            </div>
        `;
        
        // Add the summary below the item content
        menuItem.appendChild(summaryDiv);
    }
    
    // Highlight the item
    menuItem.classList.add('item-added-highlight');
    setTimeout(() => {
        menuItem.classList.remove('item-added-highlight');
    }, 1000);
}

// New function to update item quantity directly from the menu card
function updateItemQuantity(itemId, variationName, change, button) {
    // Find the item in the cart
    const cartItemIndex = cart.findIndex(item => 
        item.id === itemId && 
        (variationName === '' || item.variation?.name === variationName)
    );
    
    if (cartItemIndex === -1) return;
    
    // Update quantity
    cart[cartItemIndex].quantity += change;
    
    // Remove item if quantity is 0
    if (cart[cartItemIndex].quantity <= 0) {
        cart.splice(cartItemIndex, 1);
        
        // Remove the specific variation summary line
        const summaryDiv = button.closest('.item-summary');
        if (summaryDiv) {
            summaryDiv.remove();
        }
    } else {
        // Update the quantity display
        const quantitySpan = button.parentElement.querySelector('span');
        quantitySpan.textContent = cart[cartItemIndex].quantity;
    }
    
    // Update cart UI
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    
    // Update cart count
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart items
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';

        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">
                    ${item.name}
                    ${item.variation ? ` - ${item.variation.name}` : ''}
                </div>
                <div class="cart-item-price">₹${item.finalPrice}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${cart.indexOf(item)}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${cart.indexOf(item)}, 1)">+</button>
                </div>
            </div>
        `;
        cartItems.appendChild(div);
    });

    // Update order summary
    const subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;
}

function updateQuantity(cartIndex, change) {
    if (cartIndex < 0 || cartIndex >= cart.length) return;

    cart[cartIndex].quantity += change;
    if (cart[cartIndex].quantity <= 0) {
        cart.splice(cartIndex, 1);
    }

    updateCartUI();
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(pm => {
        pm.classList.remove('selected');
    });
    document.querySelectorAll('.payment-details').forEach(pd => {
        pd.classList.remove('active');
    });

    const methodElement = document.querySelector(`.payment-method:has(strong:contains("${method}"))`);
    const detailsElement = document.getElementById(`${method}Details`);

    if (methodElement) methodElement.classList.add('selected');
    if (detailsElement) detailsElement.classList.add('active');
}

function placeOrder() {
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items to your cart.');
        return;
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
}

function setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderMenuItems(this.dataset.category);
        });
    });
}

// Function to update cart when menu items change
function updateCartAfterMenuChange() {
    // Remove items from cart that are no longer available
    cart = cart.filter(cartItem => {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return menuItem && menuItem.status === 'available';
    });
    
    // Update cart UI
    updateCartUI();
}