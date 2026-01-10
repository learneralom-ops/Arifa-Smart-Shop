// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKl1XvPPt9iEtcRYlhbUbZk7B8fmDgroo",
    authDomain: "new-journey-shop.firebaseapp.com",
    databaseURL: "https://new-journey-shop-default-rtdb.firebaseio.com",
    projectId: "new-journey-shop",
    storageBucket: "new-journey-shop.firebasestorage.app",
    messagingSenderId: "488236854608",
    appId: "1:488236854608:web:756df2f4e743a283ec5055",
    measurementId: "G-KHW4PKN2XE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// App State
let currentUser = null;
let cart = [];
let products = [];
let categories = [];

// DOM Elements
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const productModal = document.getElementById('productModal');
const flashSaleProducts = document.getElementById('flashSaleProducts');
const featuredProducts = document.getElementById('featuredProducts');
const categoriesGrid = document.getElementById('categoriesGrid');
const skeletonLoader = document.getElementById('skeletonLoader');
const flashSaleTimer = document.getElementById('flashSaleTimer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAuth();
    loadInitialData();
    setupEventListeners();
    startBannerSlider();
    startFlashSaleTimer();
});

// Firebase Authentication
function initializeFirebaseAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.displayName || 'My Account'}`;
            loadUserCart();
        } else {
            currentUser = null;
            cart = [];
            updateCartUI();
        }
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load categories
        const categoriesSnapshot = await db.collection('categories').where('status', '==', 'active').get();
        categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCategories();

        // Load products
        const productsSnapshot = await db.collection('products').where('status', '==', 'active').limit(20).get();
        products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Render products
        renderFlashSaleProducts();
        renderFeaturedProducts();

        // Hide skeleton loader
        setTimeout(() => {
            skeletonLoader.style.display = 'none';
        }, 1000);

    } catch (error) {
        console.error('Error loading data:', error);
        // Load dummy data if Firebase fails
        loadDummyData();
    }
}

// Dummy Data for Initial Testing
function loadDummyData() {
    // Dummy Categories
    categories = [
        { id: '1', name: 'Mobile', icon: 'fas fa-mobile-alt' },
        { id: '2', name: 'Electronics', icon: 'fas fa-tv' },
        { id: '3', name: 'Fashion', icon: 'fas fa-tshirt' },
        { id: '4', name: 'Home', icon: 'fas fa-home' },
        { id: '5', name: 'Sports', icon: 'fas fa-futbol' },
        { id: '6', name: 'Beauty', icon: 'fas fa-spa' },
        { id: '7', name: 'Groceries', icon: 'fas fa-shopping-basket' },
        { id: '8', name: 'Books', icon: 'fas fa-book' }
    ];
    renderCategories();

    // Dummy Products
    products = [
        {
            id: '1',
            title: 'Samsung Galaxy S23 Ultra 5G',
            price: 125000,
            originalPrice: 135000,
            discount: 7,
            imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Mobile',
            rating: 4.5,
            reviews: 128,
            description: 'Latest Samsung flagship phone with 200MP camera, 8K video recording, and S Pen support.'
        },
        {
            id: '2',
            title: 'Apple iPhone 14 Pro Max',
            price: 145000,
            originalPrice: 155000,
            discount: 6,
            imageUrl: 'https://images.unsplash.com/photo-1663499482523-1c0c1eae723d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Mobile',
            rating: 4.7,
            reviews: 95,
            description: 'Apple iPhone with Dynamic Island, A16 Bionic chip, and 48MP main camera.'
        },
        {
            id: '3',
            title: 'Sony WH-1000XM5 Headphones',
            price: 35000,
            originalPrice: 40000,
            discount: 12,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Electronics',
            rating: 4.8,
            reviews: 210,
            description: 'Industry-leading noise cancellation with 30-hour battery life.'
        },
        {
            id: '4',
            title: 'Nike Air Max 270',
            price: 8500,
            originalPrice: 10000,
            discount: 15,
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Sports',
            rating: 4.3,
            reviews: 156,
            description: 'Comfortable sneakers with Max Air cushioning for all-day comfort.'
        },
        {
            id: '5',
            title: 'MacBook Pro 14-inch',
            price: 210000,
            originalPrice: 230000,
            discount: 9,
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Electronics',
            rating: 4.9,
            reviews: 87,
            description: 'Apple MacBook Pro with M2 Pro chip, Liquid Retina XDR display.'
        },
        {
            id: '6',
            title: 'Canon EOS R5 Camera',
            price: 320000,
            originalPrice: 350000,
            discount: 8,
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            category: 'Electronics',
            rating: 4.6,
            reviews: 42,
            description: 'Professional mirrorless camera with 45MP and 8K video recording.'
        }
    ];

    renderFlashSaleProducts();
    renderFeaturedProducts();

    // Hide skeleton loader
    setTimeout(() => {
        skeletonLoader.style.display = 'none';
    }, 1000);
}

// Render Categories
function renderCategories() {
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" data-category="${category.name}">
            <div class="category-icon">
                <i class="${category.icon || 'fas fa-box'}"></i>
            </div>
            <div class="category-name">${category.name}</div>
        </div>
    `).join('');

    // Add click event to category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterProductsByCategory(category);
        });
    });
}

// Render Flash Sale Products
function renderFlashSaleProducts() {
    const flashSaleItems = products.slice(0, 8);
    flashSaleProducts.innerHTML = flashSaleItems.map(product => createProductCard(product)).join('');

    // Add click event to product cards
    document.querySelectorAll('#flashSaleProducts .product-card').forEach((card, index) => {
        card.addEventListener('click', () => openProductModal(flashSaleItems[index]));
    });
}

// Render Featured Products
function renderFeaturedProducts() {
    const featuredItems = products.slice(0, 12);
    featuredProducts.innerHTML = featuredItems.map(product => createProductCard(product)).join('');

    // Add click event to product cards
    document.querySelectorAll('#featuredProducts .product-card').forEach((card, index) => {
        card.addEventListener('click', () => openProductModal(featuredItems[index]));
    });
}

// Create Product Card HTML
function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.title}" loading="lazy">
                ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-prices">
                    <span class="current-price">৳${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? `<span class="original-price">৳${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${createStarRating(product.rating)}
                    </div>
                    <span class="review-count">(${product.reviews || 0})</span>
                </div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Create Star Rating HTML
function createStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Open Product Modal
function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalMainImage = document.getElementById('modalMainImage');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalRating = document.getElementById('modalRating');
    const modalReviews = document.getElementById('modalReviews');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalDiscount = document.getElementById('modalDiscount');
    const modalDescription = document.getElementById('modalDescription');
    const modalAddToCart = document.getElementById('modalAddToCart');
    const modalBuyNow = document.getElementById('modalBuyNow');
    const modalQuantity = document.getElementById('modalQuantity');
    const imageThumbnails = document.querySelector('.image-thumbnails');

    // Set product data
    modalMainImage.src = product.imageUrl;
    modalMainImage.alt = product.title;
    modalProductTitle.textContent = product.title;
    modalRating.innerHTML = createStarRating(product.rating);
    modalReviews.textContent = `(${product.reviews || 0} reviews)`;
    modalCurrentPrice.textContent = `৳${product.price.toLocaleString()}`;
    
    if (product.originalPrice) {
        modalOriginalPrice.textContent = `৳${product.originalPrice.toLocaleString()}`;
        modalOriginalPrice.style.display = 'inline';
    } else {
        modalOriginalPrice.style.display = 'none';
    }
    
    if (product.discount) {
        modalDiscount.textContent = `-${product.discount}%`;
        modalDiscount.style.display = 'inline-block';
    } else {
        modalDiscount.style.display = 'none';
    }
    
    modalDescription.textContent = product.description;

    // Set up thumbnails (using same image for demo)
    imageThumbnails.innerHTML = `
        <div class="thumbnail active"><img src="${product.imageUrl}" alt="Thumbnail 1"></div>
        <div class="thumbnail"><img src="${product.imageUrl}" alt="Thumbnail 2"></div>
        <div class="thumbnail"><img src="${product.imageUrl}" alt="Thumbnail 3"></div>
    `;

    // Set up button events
    modalAddToCart.onclick = () => addToCart(product.id, parseInt(modalQuantity.value));
    modalBuyNow.onclick = () => buyNow(product.id, parseInt(modalQuantity.value));

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Add to Cart
async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        loginModal.classList.add('active');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity
        });
    }

    updateCartUI();
    saveCartToFirebase();
    showNotification('Product added to cart!');
}

// Update Cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">৳${item.price.toLocaleString()}</div>
                    <div class="cart-item-controls">
                        <div class="cart-item-qty">
                            <button class="qty-minus" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button class="qty-plus" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Calculate total price
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = `৳${totalPrice.toLocaleString()}`;
    }
}

// Update Cart Quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartUI();
            saveCartToFirebase();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToFirebase();
}

// Save Cart to Firebase
async function saveCartToFirebase() {
    if (!currentUser) return;

    try {
        await db.collection('carts').doc(currentUser.uid).set({
            userId: currentUser.uid,
            items: cart,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Load User Cart from Firebase
async function loadUserCart() {
    if (!currentUser) return;

    try {
        const cartDoc = await db.collection('carts').doc(currentUser.uid).get();
        if (cartDoc.exists) {
            cart = cartDoc.data().items || [];
            updateCartUI();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Cart toggle
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });

    // Close cart
    document.querySelector('.close-cart').addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    document.querySelector('.continue-shopping').addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    // Login button
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Modal background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tab}Tab`).classList.add('active');
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginModal.classList.remove('active');
            showNotification('Login successful!');
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            
            // Save additional user data
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            loginModal.classList.remove('active');
            showNotification('Registration successful!');
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Quantity controls in modal
    document.querySelector('.qty-minus').addEventListener('click', () => {
        const input = document.getElementById('modalQuantity');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });

    document.querySelector('.qty-plus').addEventListener('click', () => {
        const input = document.getElementById('modalQuantity');
        input.value = parseInt(input.value) + 1;
    });

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
}

// Banner Slider
function startBannerSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);

    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
}

// Flash Sale Timer
function startFlashSaleTimer() {
    const hoursElement = flashSaleTimer.querySelectorAll('.time-box')[0];
    const minutesElement = flashSaleTimer.querySelectorAll('.time-box')[1];
    const secondsElement = flashSaleTimer.querySelectorAll('.time-box')[2];

    let hours = 2;
    let minutes = 15;
    let seconds = 30;

    const timer = setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    clearInterval(timer);
                    flashSaleTimer.innerHTML = '<span class="expired">Flash Sale Ended!</span>';
                    return;
                }
            }
        }

        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Search Functionality
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );

    // Clear current products
    featuredProducts.innerHTML = '';

    if (filteredProducts.length === 0) {
        featuredProducts.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found for "${query}"</h3>
                <p>Try different keywords or browse categories</p>
            </div>
        `;
    } else {
        featuredProducts.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
        
        // Add click event to product cards
        document.querySelectorAll('#featuredProducts .product-card').forEach((card, index) => {
            card.addEventListener('click', () => openProductModal(filteredProducts[index]));
        });
    }
}

// Filter Products by Category
function filterProductsByCategory(category) {
    const filteredProducts = products.filter(product => 
        product.category === category
    );

    featuredProducts.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    // Add click event to product cards
    document.querySelectorAll('#featuredProducts .product-card').forEach((card, index) => {
        card.addEventListener('click', () => openProductModal(filteredProducts[index]));
    });
}

// Buy Now Function
function buyNow(productId, quantity = 1) {
    if (!currentUser) {
        alert('Please login to place an order');
        loginModal.classList.add('active');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Add to cart first
    addToCart(productId, quantity);
    
    // Close product modal
    productModal.classList.remove('active');
    
    // Open checkout
    checkout();
}

// Checkout Function
async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    if (!currentUser) {
        alert('Please login to checkout');
        loginModal.classList.add('active');
        return;
    }

    try {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderId = 'ORD' + Date.now();

        const order = {
            orderId: orderId,
            userId: currentUser.uid,
            products: cart,
            totalPrice: totalPrice,
            status: 'pending',
            shippingAddress: '',
            paymentMethod: 'cash',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save order to Firebase
        await db.collection('orders').doc(orderId).set(order);
        
        // Clear cart
        cart = [];
        await saveCartToFirebase();
        updateCartUI();
        
        // Close cart sidebar
        cartSidebar.classList.remove('active');
        
        // Show success message
        showNotification(`Order #${orderId} placed successfully!`);
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Checkout failed. Please try again.');
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Admin Panel Link (for testing)
if (window.location.hash === '#admin') {
    setTimeout(() => {
        alert('Switch to admin panel: admin.html');
    }, 1000);
}
