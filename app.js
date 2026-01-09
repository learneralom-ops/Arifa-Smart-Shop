// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.querySelector('.search-btn');
const accountBtn = document.getElementById('account-btn');
const accountText = document.getElementById('account-text');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.querySelector('.cart-count');
const categoriesGrid = document.getElementById('categories-grid');
const productsGrid = document.getElementById('products-grid');
const flashProducts = document.getElementById('flash-products');
const loadMoreBtn = document.getElementById('load-more-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItems = document.getElementById('cart-items');
const totalPriceEl = document.querySelector('.total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const closeCart = document.querySelector('.close-cart');

// Modal Elements
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const productModal = document.getElementById('product-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

// Form Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');

// Countdown Timer
const hoursEl = document.querySelector('.hours');
const minutesEl = document.querySelector('.minutes');
const secondsEl = document.querySelector('.seconds');

// Loading Overlay
const loadingOverlay = document.getElementById('loading-overlay');

// State Variables
let currentUser = null;
let products = [];
let filteredProducts = [];
let categories = [];
let banners = [];
let cart = [];
let currentProductPage = 0;
const productsPerPage = 12;

// Initialize Swiper
let bannerSwiper = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initEventListeners();
    updateCartCount();
    startCountdownTimer();
});

// Initialize the app
async function initApp() {
    showLoading();
    
    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            accountText.textContent = user.displayName || 'My Account';
            loadUserCart();
        } else {
            currentUser = null;
            accountText.textContent = 'Login / Register';
            cart = [];
            updateCartCount();
        }
    });
    
    // Load data from Firebase
    await Promise.all([
        loadCategories(),
        loadProducts(),
        loadBanners(),
        loadFlashProducts()
    ]);
    
    hideLoading();
    initSwiper();
}

// Event Listeners
function initEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Account modal
    accountBtn.addEventListener('click', () => {
        if (currentUser) {
            // Show user menu (to be implemented)
            console.log('User is logged in');
        } else {
            openModal(loginModal);
        }
    });
    
    // Cart sidebar
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        renderCartItems();
    });
    
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });
    
    // Modal close buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Switch between login and register
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllModals();
        openModal(registerModal);
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeAllModals();
        openModal(loginModal);
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === registerModal) closeModal(registerModal);
        if (e.target === productModal) closeModal(productModal);
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Load more products
    loadMoreBtn.addEventListener('click', loadMoreProducts);
    
    // Checkout button
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Category filtering
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.getAttribute('href').replace('#', '');
            filterProductsByCategory(category);
            
            // Update active state
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Firebase Data Loading Functions
async function loadCategories() {
    try {
        const snapshot = await db.collection('categories').get();
        categoriesGrid.innerHTML = '';
        
        snapshot.docs.forEach(doc => {
            const category = { id: doc.id, ...doc.data() };
            categories.push(category);
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <i class="${category.iconUrl || 'fas fa-box'}"></i>
                <h4>${category.name}</h4>
            `;
            categoryCard.addEventListener('click', () => {
                filterProductsByCategory(category.id);
            });
            
            categoriesGrid.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

async function loadProducts() {
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .limit(50)
            .get();
        
        products = [];
        snapshot.docs.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        filteredProducts = [...products];
        renderProducts(products.slice(0, productsPerPage));
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

async function loadFlashProducts() {
    try {
        const snapshot = await db.collection('products')
            .where('discount', '>=', 20)
            .where('status', '==', 'active')
            .limit(8)
            .get();
        
        flashProducts.innerHTML = '';
        snapshot.docs.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            const productCard = createProductCard(product);
            flashProducts.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading flash products:', error);
        showError('Failed to load flash sale products');
    }
}

async function loadBanners() {
    try {
        const snapshot = await db.collection('banners').get();
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        
        snapshot.docs.forEach(doc => {
            const banner = doc.data();
            banners.push(banner);
            
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <img src="${banner.imageUrl}" alt="Banner">
            `;
            swiperWrapper.appendChild(slide);
        });
    } catch (error) {
        console.error('Error loading banners:', error);
        // Add default banner if none exist
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        swiperWrapper.innerHTML = `
            <div class="swiper-slide">
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" alt="Default Banner">
            </div>
        `;
    }
}

// Product Rendering Functions
function renderProducts(productsToRender) {
    if (currentProductPage === 0) {
        productsGrid.innerHTML = '';
    }
    
    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Show/hide load more button
    if (filteredProducts.length > (currentProductPage + 1) * productsPerPage) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discount = product.discount || 0;
    const originalPrice = product.price || 0;
    const discountedPrice = originalPrice * (1 - discount / 100);
    const rating = product.rating || 4.5;
    
    card.innerHTML = `
        ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
        <img src="${product.imageUrl || 'https://via.placeholder.com/250x200'}" 
             alt="${product.title}" 
             class="product-image"
             onerror="this.src='https://via.placeholder.com/250x200'">
        <div class="product-info">
            <h3 class="product-title">${product.title || 'Product Name'}</h3>
            <div class="product-price">
                <span class="current-price">৳ ${discountedPrice.toFixed(2)}</span>
                ${discount > 0 ? `<span class="original-price">৳ ${originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="product-rating">
                <div class="rating-stars">
                    ${generateStarRating(rating)}
                </div>
                <span class="rating-count">(${Math.floor(Math.random() * 100) + 20})</span>
            </div>
            <button class="add-to-cart-btn" data-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    
    // Add event listeners
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
    });
    
    card.addEventListener('click', () => {
        showProductDetails(product);
    });
    
    return card;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Product Details Modal
function showProductDetails(product) {
    const modalContent = document.querySelector('.product-details');
    const discount = product.discount || 0;
    const originalPrice = product.price || 0;
    const discountedPrice = originalPrice * (1 - discount / 100);
    
    modalContent.innerHTML = `
        <div class="product-gallery">
            <img src="${product.imageUrl || 'https://via.placeholder.com/400x300'}" 
                 alt="${product.title}"
                 onerror="this.src='https://via.placeholder.com/400x300'">
        </div>
        <div class="product-info-details">
            <h2>${product.title}</h2>
            <div class="product-price-details">
                <div class="price-row">
                    <span class="current-price">৳ ${discountedPrice.toFixed(2)}</span>
                    ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                </div>
                ${discount > 0 ? `<p class="original-price">৳ ${originalPrice.toFixed(2)}</p>` : ''}
            </div>
            <div class="product-description">
                <p>${product.description || 'No description available.'}</p>
            </div>
            <div class="quantity-selector">
                <button class="quantity-btn minus">-</button>
                <span class="quantity">1</span>
                <button class="quantity-btn plus">+</button>
            </div>
            <div class="action-buttons">
                <button class="btn-secondary" id="add-to-cart-modal">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn-primary" id="buy-now-btn">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners for modal
    const minusBtn = modalContent.querySelector('.minus');
    const plusBtn = modalContent.querySelector('.plus');
    const quantityEl = modalContent.querySelector('.quantity');
    const addToCartModalBtn = modalContent.querySelector('#add-to-cart-modal');
    const buyNowBtn = modalContent.querySelector('#buy-now-btn');
    
    let quantity = 1;
    
    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityEl.textContent = quantity;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        quantity++;
        quantityEl.textContent = quantity;
    });
    
    addToCartModalBtn.addEventListener('click', () => {
        addToCart(product, quantity);
        closeModal(productModal);
        showNotification('Product added to cart!');
    });
    
    buyNowBtn.addEventListener('click', () => {
        addToCart(product, quantity);
        closeModal(productModal);
        cartSidebar.classList.add('active');
        renderCartItems();
        showNotification('Product added to cart!');
    });
    
    openModal(productModal);
}

// Cart Functions
function addToCart(product, quantity = 1) {
    if (!currentUser) {
        openModal(loginModal);
        showNotification('Please login to add items to cart');
        return;
    }
    
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price * (1 - (product.discount || 0) / 100),
            imageUrl: product.imageUrl,
            quantity: quantity
        });
    }
    
    updateCartCount();
    saveCartToFirebase();
    showNotification('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToFirebase();
    renderCartItems();
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartCount();
        saveCartToFirebase();
        renderCartItems();
    }
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPriceEl.textContent = '৳ 0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.imageUrl || 'https://via.placeholder.com/80x80'}" 
                 alt="${item.title}" 
                 class="cart-item-img"
                 onerror="this.src='https://via.placeholder.com/80x80'">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">৳ ${item.price.toFixed(2)}</p>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItemEl);
    });
    
    totalPriceEl.textContent = `৳ ${total.toFixed(2)}`;
    
    // Add event listeners to cart items
    document.querySelectorAll('.cart-item-quantity .minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-quantity .plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('.cart-item-remove').getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

async function loadUserCart() {
    if (!currentUser) return;
    
    try {
        const cartDoc = await db.collection('carts').doc(currentUser.uid).get();
        if (cartDoc.exists) {
            cart = cartDoc.data().items || [];
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

async function saveCartToFirebase() {
    if (!currentUser) return;
    
    try {
        await db.collection('carts').doc(currentUser.uid).set({
            items: cart,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading();
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        closeModal(loginModal);
        showNotification('Login successful!');
        
        // Load user cart after login
        await loadUserCart();
    } catch (error) {
        console.error('Login error:', error);
        showError(getAuthErrorMessage(error));
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;
    
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    showLoading();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        // Save user to Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        currentUser = userCredential.user;
        
        closeModal(registerModal);
        showNotification('Registration successful!');
    } catch (error) {
        console.error('Registration error:', error);
        showError(getAuthErrorMessage(error));
    } finally {
        hideLoading();
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Incorrect password';
        default:
            return 'Authentication failed. Please try again.';
    }
}

// Product Filtering
function filterProductsByCategory(categoryId) {
    if (categoryId === 'all-products') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === categoryId);
    }
    
    currentProductPage = 0;
    renderProducts(filteredProducts.slice(0, productsPerPage));
}

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    currentProductPage = 0;
    renderProducts(filteredProducts.slice(0, productsPerPage));
}

function loadMoreProducts() {
    currentProductPage++;
    const start = currentProductPage * productsPerPage;
    const end = start + productsPerPage;
    renderProducts(filteredProducts.slice(start, end));
}

// Checkout Function
async function handleCheckout() {
    if (!currentUser) {
        openModal(loginModal);
        showNotification('Please login to checkout');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    showLoading();
    
    try {
        const orderId = 'ORD' + Date.now();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const order = {
            orderId: orderId,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userEmail: currentUser.email,
            items: cart,
            total: total,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('orders').doc(orderId).set(order);
        
        // Clear cart
        cart = [];
        await saveCartToFirebase();
        updateCartCount();
        
        cartSidebar.classList.remove('active');
        showNotification('Order placed successfully!');
        
    } catch (error) {
        console.error('Checkout error:', error);
        showError('Failed to place order. Please try again.');
    } finally {
        hideLoading();
    }
}

// UI Helper Functions
function openModal(modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function closeAllModals() {
    closeModal(loginModal);
    closeModal(registerModal);
    closeModal(productModal);
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .notification.success {
                background-color: var(--success);
            }
            .notification.error {
                background-color: var(--danger);
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

// Countdown Timer
function startCountdownTimer() {
    // Set end time to 12 hours from now
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 12);
    
    function updateTimer() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Initialize Swiper
function initSwiper() {
    bannerSwiper = new Swiper('.banner-swiper', {
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    if (bannerSwiper) {
        bannerSwiper.update();
    }
});
