// Load menu items from localStorage or use sample data
let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [
    {
        id: 1,
        name: "Butter Chicken",
        category: "main",
        price: 350,
        description: "Tender chicken pieces in rich, creamy tomato sauce",
        image: "https://source.unsplash.com/random/300x200/?butter-chicken",
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
        name: "Paneer Tikka",
        category: "appetizers",
        price: 280,
        description: "Marinated and grilled cottage cheese cubes",
        image: "https://source.unsplash.com/random/300x200/?paneer-tikka",
        status: "available",
        variations: [
            { name: "Regular", price: 280 },
            { name: "Large", price: 350 }
        ],
        tags: ["vegetarian", "popular"],
        preparationTime: 15,
        calories: 320,
        dietary: {
            vegetarian: true,
            vegan: false,
            glutenFree: true
        }
    },
    {
        id: 3,
        name: "Veg Biryani",
        category: "main",
        price: 220,
        description: "Fragrant rice cooked with mixed vegetables and aromatic spices",
        image: "https://source.unsplash.com/random/300x200/?biryani",
        status: "available",
        variations: [
            { name: "Regular", price: 220 },
            { name: "Family Pack", price: 400 }
        ],
        tags: ["vegetarian", "rice"],
        preparationTime: 25,
        calories: 380,
        dietary: {
            vegetarian: true,
            vegan: true,
            glutenFree: false
        }
    },
    {
        id: 4,
        name: "Masala Dosa",
        category: "main",
        price: 120,
        description: "Crispy crepe filled with spiced potato mixture",
        image: "https://source.unsplash.com/random/300x200/?dosa",
        status: "available",
        variations: [
            { name: "Plain", price: 100 },
            { name: "Masala", price: 120 },
            { name: "Mysore", price: 140 }
        ],
        tags: ["vegetarian", "breakfast", "popular"],
        preparationTime: 10,
        calories: 250,
        dietary: {
            vegetarian: true,
            vegan: true,
            glutenFree: false
        }
    }
];

// DOM Elements
const menuGrid = document.querySelector('.menu-grid');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.querySelector('.btn-search input');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const modalTabs = document.querySelectorAll('.modal-tab');
let currentCategory = 'all';
let editingItemId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Category filter
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentCategory = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderMenuItems();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
        renderMenuItems(filteredItems);
    });

    // Form submission
    itemForm.addEventListener('submit', handleFormSubmit);
    
    // Add variation button
    document.querySelector('.btn-add-variation').addEventListener('click', addVariationRow);
    
    // Initial variation row remove button
    document.querySelector('.btn-remove-variation').addEventListener('click', function() {
        this.closest('.variation-row').remove();
    });
    
    // Modal tabs
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            modalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Render menu items
function renderMenuItems(items = menuItems) {
    menuGrid.innerHTML = '';
    
    const filteredItems = currentCategory === 'all' 
        ? items 
        : items.filter(item => item.category === currentCategory);

    filteredItems.forEach(item => {
        const card = createMenuItemCard(item);
        menuGrid.appendChild(card);
    });
}

// Create menu item card
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    
    // Create status badge
    const statusBadge = getStatusBadge(item.status);
    
    // Create tags HTML
    const tagsHtml = item.tags && item.tags.length > 0 
        ? `<div class="menu-item-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` 
        : '';
    
    card.innerHTML = `
        <div class="menu-item-image" style="background-image: url('${item.image}')">
            ${statusBadge}
        </div>
        <div class="menu-item-content">
            <div class="menu-item-header">
                <h3 class="menu-item-name">${item.name}</h3>
                <span class="menu-item-price">₹${item.price}</span>
            </div>
            <p class="menu-item-description">${item.description}</p>
            ${tagsHtml}
            <div class="menu-item-variations">
                ${item.variations && item.variations.length > 0 
                    ? `<p>Variations: ${item.variations.map(v => `${v.name} (₹${v.price})`).join(', ')}</p>` 
                    : ''}
            </div>
            <div class="menu-item-actions">
                <button class="btn-edit" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Get status badge HTML
function getStatusBadge(status) {
    if (!status || status === 'available') return '';
    
    let badgeClass = '';
    let badgeText = '';
    
    switch(status) {
        case 'out_of_stock':
            badgeClass = 'badge-danger';
            badgeText = 'Out of Stock';
            break;
        case 'coming_soon':
            badgeClass = 'badge-warning';
            badgeText = 'Coming Soon';
            break;
        default:
            return '';
    }
    
    return `<div class="status-badge ${badgeClass}">${badgeText}</div>`;
}

// Add a new variation row
function addVariationRow() {
    const container = document.getElementById('variations-container');
    const newRow = document.createElement('div');
    newRow.className = 'variation-row';
    
    newRow.innerHTML = `
        <input type="text" placeholder="Variation Name" class="variation-name">
        <input type="number" placeholder="Price" class="variation-price">
        <button type="button" class="btn-remove-variation">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(newRow);
    
    // Add event listener to the new remove button
    newRow.querySelector('.btn-remove-variation').addEventListener('click', function() {
        this.closest('.variation-row').remove();
    });
}

// Show notification
function showNotification(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        backgroundColor: type === 'success' ? "#10B981" : 
                         type === 'error' ? "#EF4444" : "#3B82F6",
        className: "toast-notification",
        stopOnFocus: true
    }).showToast();
}

// Modal functions
function openAddItemModal() {
    editingItemId = null;
    itemForm.reset();
    
    // Reset variations
    const variationsContainer = document.getElementById('variations-container');
    variationsContainer.innerHTML = `
        <div class="variation-row">
            <input type="text" placeholder="Variation Name" class="variation-name">
            <input type="number" placeholder="Price" class="variation-price">
            <button type="button" class="btn-remove-variation">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add event listener to the reset remove button
    variationsContainer.querySelector('.btn-remove-variation').addEventListener('click', function() {
        this.closest('.variation-row').remove();
    });
    
    // Update modal title
    document.querySelector('.modal-header h2').textContent = 'Add New Item';
    
    // Reset to first tab
    modalTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    modalTabs[0].classList.add('active');
    document.getElementById('basic-info-tab').classList.add('active');
    
    itemModal.classList.add('active');
}

function closeModal() {
    itemModal.classList.remove('active');
    editingItemId = null;
}

function editItem(id) {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;

    editingItemId = id;
    
    // Update modal title
    document.querySelector('.modal-header h2').textContent = 'Edit Item';
    
    // Fill in basic fields
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemImage').value = item.image;
    document.getElementById('itemStatus').value = item.status || 'available';
    
    // Fill in tags
    document.getElementById('itemTags').value = item.tags ? item.tags.join(', ') : '';
    
    // Fill in preparation time and calories
    document.getElementById('prepTime').value = item.preparationTime || '';
    document.getElementById('calories').value = item.calories || '';
    
    // Fill in dietary information
    document.getElementById('vegetarian').checked = item.dietary ? item.dietary.vegetarian : false;
    document.getElementById('vegan').checked = item.dietary ? item.dietary.vegan : false;
    document.getElementById('glutenFree').checked = item.dietary ? item.dietary.glutenFree : false;
    
    // Fill in variations
    const variationsContainer = document.getElementById('variations-container');
    variationsContainer.innerHTML = '';
    
    if (item.variations && item.variations.length > 0) {
        item.variations.forEach(variation => {
            const variationRow = document.createElement('div');
            variationRow.className = 'variation-row';
            
            variationRow.innerHTML = `
                <input type="text" placeholder="Variation Name" class="variation-name" value="${variation.name}">
                <input type="number" placeholder="Price" class="variation-price" value="${variation.price}">
                <button type="button" class="btn-remove-variation">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            variationsContainer.appendChild(variationRow);
            
            // Add event listener to the remove button
            variationRow.querySelector('.btn-remove-variation').addEventListener('click', function() {
                this.closest('.variation-row').remove();
            });
        });
    } else {
        // Add an empty variation row if none exist
        addVariationRow();
    }
    
    // Reset to first tab
    modalTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    modalTabs[0].classList.add('active');
    document.getElementById('basic-info-tab').classList.add('active');

    itemModal.classList.add('active');
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect variations
    const variationRows = document.querySelectorAll('.variation-row');
    const variations = [];
    
    variationRows.forEach(row => {
        const name = row.querySelector('.variation-name').value.trim();
        const price = parseFloat(row.querySelector('.variation-price').value);
        
        if (name && !isNaN(price)) {
            variations.push({ name, price });
        }
    });
    
    // Collect tags
    const tagsInput = document.getElementById('itemTags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Collect dietary information
    const dietary = {
        vegetarian: document.getElementById('vegetarian').checked,
        vegan: document.getElementById('vegan').checked,
        glutenFree: document.getElementById('glutenFree').checked
    };
    
    const formData = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        image: document.getElementById('itemImage').value || `https://source.unsplash.com/random/300x200/?${document.getElementById('itemName').value.toLowerCase().replace(/\s+/g, '-')}`,
        status: document.getElementById('itemStatus').value,
        variations: variations,
        tags: tags,
        preparationTime: parseInt(document.getElementById('prepTime').value) || null,
        calories: parseInt(document.getElementById('calories').value) || null,
        dietary: dietary
    };

    if (editingItemId) {
        // Update existing item
        const index = menuItems.findIndex(item => item.id === editingItemId);
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], ...formData };
            showNotification(`${formData.name} has been updated successfully!`, 'success');
        }
    } else {
        // Add new item
        const newId = Math.max(...menuItems.map(item => item.id), 0) + 1;
        menuItems.push({ id: newId, ...formData });
        showNotification(`${formData.name} has been added to the menu!`, 'success');
    }

    // Save to localStorage for user page to access
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    
    renderMenuItems();
    closeModal();
}

// Delete item
function deleteItem(id) {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;
    
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        menuItems = menuItems.filter(item => item.id !== id);
        
        // Save to localStorage for user page to access
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        
        showNotification(`${item.name} has been deleted from the menu.`, 'error');
        renderMenuItems();
    }
}

// Close modal when clicking outside
itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        closeModal();
    }
}); 