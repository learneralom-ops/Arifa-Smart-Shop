// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbc54ZsWBXFqX50KvY85kbHkUo_Ct5hLk",
  authDomain: "arifa-shop.firebaseapp.com",
  databaseURL: "https://arifa-shop-default-rtdb.firebaseio.com",
  projectId: "arifa-shop",
  storageBucket: "arifa-shop.firebasestorage.app",
  messagingSenderId: "792267788402",
  appId: "1:792267788402:web:96dd32886699ff188472eb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeLogin = document.getElementById('closeLogin');
const closeRegister = document.getElementById('closeRegister');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const productModal = document.getElementById('productModal');
const closeProduct = document.getElementById('closeProduct');
const productGrid = document.getElementById('productGrid');
const categoryGrid = document.getElementById('categoryGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const successMessage = document.getElementById('successMessage');
const closeSuccess = document.getElementById('closeSuccess');

// State Management
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let categories = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateCartCount();
    setupEventListeners();
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Login / Register';
        }
    });
});

// Setup Event Listeners
function setupEventListeners() {
    // Modal Controls
    loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    closeLogin.addEventListener('click', () => loginModal.classList.remove('active'));
    closeRegister.addEventListener('click', () => registerModal.classList.remove('active'));
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Cart Controls
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        renderCartItems();
    });
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));
    checkoutBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        checkoutModal.classList.add('active');
        renderOrderSummary();
    });
    closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('active'));
    closeProduct.addEventListener('click', () => productModal.classList.remove('active'));

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    checkoutForm.addEventListener('submit', handleCheckout);

    // Search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Success Message
    closeSuccess.addEventListener('click', () => {
        successMessage.classList.remove('active');
    });
}

// Firebase Authentication
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginModal.classList.remove('active');
        showNotification('Login successful!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save user data to database
        await database.ref('users/' + user.uid).set({
            name: name,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString()
        });

        registerModal.classList.remove('active');
        showNotification('Registration successful!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Load Categories from Firebase
async function loadCategories() {
    try {
        const snapshot = await database.ref('categories').once('value');
        categories = snapshot.val() || getDefaultCategories();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = getDefaultCategories();
        renderCategories();
    }
}

function getDefaultCategories() {
    return [
        { id: 1, name: 'Sex Toy', icon: 'fas fa-heart' },
        { id: 2, name: 'Electronics', icon: 'fas fa-laptop' },
        { id: 3, name: 'Fashion', icon: 'fas fa-tshirt' },
        { id: 4, name: 'Grocery', icon: 'fas fa-shopping-basket' },
        { id: 5, name: 'Mobile', icon: 'fas fa-mobile-alt' },
        { id: 6, name: 'Accessories', icon: 'fas fa-headphones' }
    ];
}

function renderCategories() {
    categoryGrid.innerHTML = categories.map(category => `
        <div class="category-card" data-category="${category.id}">
            <i class="${category.icon}"></i>
            <h3>${category.name}</h3>
        </div>
    `).join('');

    // Add event listeners to category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.category;
            filterProductsByCategory(categoryId);
        });
    });
}

// Load Products from Firebase
async function loadProducts() {
    try {
        const snapshot = await database.ref('products').once('value');
        products = snapshot.val() || getDefaultProducts();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        products = getDefaultProducts();
        renderProducts(products);
    }
}

function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'Smart Watch Series 5',
            price: ৳ 5999,
            originalPrice: ৳ 7999,
            discount: 25,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 2,
            description: 'Latest smart watch with heart rate monitor, GPS, and water resistance.',
            stock: 50
        },
        {
            id: 2,
            name: 'Wireless Headphones',
            price: ৳ 2499,
            originalPrice: ৳ 3499,
            discount: 29,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 6,
            description: 'Noise cancelling wireless headphones with 30 hours battery life.',
            stock: 100
        },
        {
            id: 3,
            name: 'Premium T-Shirt',
            price: ৳ 899,
            originalPrice: ৳ 1299,
            discount: 31,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 3,
            description: '100% cotton premium t-shirt with unique design.',
            stock: 200
        },
        {
            id: 4,
            name: 'Organic Coffee',
            price: ৳ 499,
            originalPrice: ৳ 699,
            discount: 29,
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 4,
            description: 'Premium organic coffee beans from Ethiopia.',
            stock: 150
        },
        {
            id: 5,
            name: 'Smartphone X',
            price: ৳ 24999,
            originalPrice: ৳ 29999,
            discount: 17,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 5,
            description: 'Latest smartphone with triple camera and 128GB storage.',
            stock: 30
        },
        {
            id: 6,
            name: 'Massage Device',
            price: ৳ 3499,
            originalPrice: ৳ 4999,
            discount: 30,
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 1,
            description: 'Electric massage device for relaxation and stress relief.',
            stock: 80
        }
    ];
}

function renderProducts(productsToRender) {
    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                    ${product.discount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-secondary view-details-btn">View Details</button>
                    <button class="btn-primary add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productId = parseInt(productCard.dataset.id);
            showProductDetails(productId);
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productId = parseInt(productCard.dataset.id);
            addToCart(productId);
        });
    });
}

// Product Details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const category = categories.find(c => c.id === product.category);
    
    document.getElementById('productModalContent').innerHTML = `
        <div class="product-modal-left">
            <img src="${product.image}" alt="${product.name}" class="product-modal-image">
        </div>
        <div class="product-modal-right">
            <h2>${product.name}</h2>
            ${category ? `<p class="product-category">Category: ${category.name}</p>` : ''}
            <div class="product-modal-price">${product.price}</div>
            ${product.originalPrice ? `<p class="original-price">Was: ${product.originalPrice}</p>` : ''}
            ${product.discount ? `<p class="discount-info">Save ${product.discount}%</p>` : ''}
            <p class="product-modal-description">${product.description}</p>
            <p class="stock-info">Stock: ${product.stock} units available</p>
            <div class="product-actions" style="margin-top: 20px;">
                <button class="btn-primary add-to-cart-modal">Add to Cart</button>
                <button class="btn-secondary buy-now-btn">Buy Now</button>
            </div>
        </div>
    `;

    // Add event listeners for modal buttons
    const addToCartModalBtn = document.querySelector('.add-to-cart-modal');
    const buyNowBtn = document.querySelector('.buy-now-btn');

    addToCartModalBtn.addEventListener('click', () => {
        addToCart(productId);
        productModal.classList.remove('active');
    });

    buyNowBtn.addEventListener('click', () => {
        addToCart(productId);
        productModal.classList.remove('active');
        cartSidebar.classList.add('active');
        renderCartItems();
    });

    productModal.classList.add('active');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity < 1) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        document.querySelector('.cart-total .total-price').textContent = '৳ 0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-btn">+</button>
                </div>
            </div>
            <button class="remove-item">&times;</button>
        </div>
    `).join('');

    // Calculate total
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('৳', '').replace(',', '').trim());
        return sum + (price * item.quantity);
    }, 0);

    document.querySelector('.cart-total .total-price').textContent = `৳ ${total.toLocaleString('en-BD')}`;

    // Add event listeners
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').dataset.id);
            updateQuantity(productId, -1);
        });
    });

    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').dataset.id);
            updateQuantity(productId, 1);
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').dataset.id);
            removeFromCart(productId);
        });
    });
}

// Checkout Functions
function renderOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('৳', '').replace(',', '').trim());
        return sum + (price * item.quantity);
    }, 0);

    orderSummary.innerHTML = `
        <div class="order-summary-item">
            <span>Subtotal (${cart.length} items):</span>
            <span>৳ ${total.toLocaleString('en-BD')}</span>
        </div>
        <div class="order-summary-item">
            <span>Delivery Charge:</span>
            <span>৳ 60</span>
        </div>
        <div class="order-summary-item" style="font-weight: bold; font-size: 18px;">
            <span>Total:</span>
            <span>৳ ${(total + 60).toLocaleString('en-BD')}</span>
        </div>
    `;
}

async function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;

    if (!name || !phone || !address) {
        showNotification('Please fill all fields!', 'error');
        return;
    }

    try {
        const orderData = {
            customerName: name,
            customerPhone: phone,
            customerAddress: address,
            customerEmail: currentUser ? currentUser.email : 'guest',
            items: cart,
            total: cart.reduce((sum, item) => {
                const price = parseFloat(item.price.replace('৳', '').replace(',', '').trim());
                return sum + (price * item.quantity);
            }, 0) + 60,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save order to Firebase
        const orderRef = database.ref('orders').push();
        await orderRef.set(orderData);

        // Facebook Pixel Purchase Event
        fbq('track', 'Purchase', {
            value: orderData.total,
            currency: 'BDT'
        });

        // Clear cart
        cart = [];
        saveCart();
        updateCartCount();
        
        // Close modals and show success
        checkoutModal.classList.remove('active');
        successMessage.classList.add('active');
        
        // Reset form
        checkoutForm.reset();
        
        showNotification('Order placed successfully!', 'success');
    } catch (error) {
        showNotification('Error placing order: ' + error.message, 'error');
    }
}

// Search and Filter Functions
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        renderProducts(products);
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );

    renderProducts(filteredProducts);
}

function filterProductsByCategory(categoryId) {
    const filteredProducts = products.filter(product => 
        product.category == categoryId
    );
    renderProducts(filteredProducts);
}

// Utility Functions
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin: 0;
        line-height: 1;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(notification);

    // Add close functionality
    closeBtn.addEventListener('click', () => notification.remove());

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Prevent form submission on enter in search
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});
