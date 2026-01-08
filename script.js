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
const cartBtn = document.getElementById('cartBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const loginModal = document.getElementById('loginModal');
const cartSidebar = document.getElementById('cartSidebar');
const productModal = document.getElementById('productModal');
const checkoutModal = document.getElementById('checkoutModal');
const successModal = document.getElementById('successModal');
const closeButtons = document.querySelectorAll('.close');
const closeCartBtn = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShoppingBtn = document.getElementById('continueShopping');
const authForm = document.getElementById('authForm');
const registerBtn = document.getElementById('registerBtn');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const authMessage = document.getElementById('authMessage');
const checkoutForm = document.getElementById('checkoutForm');
const categoryList = document.getElementById('categoryList');
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const totalPrice = document.querySelector('.total-price');
const sortSelect = document.getElementById('sortSelect');

// Global Variables
let currentUser = null;
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let categories = [
    { id: 1, name: 'Sex Toy', icon: 'fas fa-heart' },
    { id: 2, name: 'Electronics', icon: 'fas fa-laptop' },
    { id: 3, name: 'Fashion', icon: 'fas fa-tshirt' },
    { id: 4, name: 'Grocery', icon: 'fas fa-shopping-basket' },
    { id: 5, name: 'Mobile', icon: 'fas fa-mobile-alt' },
    { id: 6, name: 'Accessories', icon: 'fas fa-headphones' }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateCartCount();
    renderCart();
    
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.email.split('@')[0]}`;
            loginBtn.onclick = () => auth.signOut();
        } else {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
            loginBtn.onclick = () => loginModal.style.display = 'block';
        }
    });
});

// Event Listeners
loginBtn.addEventListener('click', () => {
    if (!currentUser) loginModal.style.display = 'block';
});

cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        productModal.style.display = 'none';
        checkoutModal.style.display = 'none';
        successModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === productModal) productModal.style.display = 'none';
    if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    if (e.target === successModal) successModal.style.display = 'none';
});

searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProducts();
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    cartSidebar.classList.remove('active');
    showCheckoutModal();
});

continueShoppingBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
});

registerBtn.addEventListener('click', () => {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showMessage('Account created successfully!', 'success');
            loginModal.style.display = 'none';
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 1000);
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
});

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    placeOrder();
});

sortSelect.addEventListener('change', sortProducts);

// Functions
function loadCategories() {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <i class="${category.icon}"></i>
            <h3>${category.name}</h3>
        `;
        categoryItem.addEventListener('click', () => {
            filterProductsByCategory(category.name);
        });
        categoryList.appendChild(categoryItem);
    });
}

function loadProducts() {
    // Try to load from Firebase first, then use sample data
    database.ref('products').once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                const productsData = snapshot.val();
                products = Object.values(productsData);
            } else {
                // Load sample products if no data in Firebase
                loadSampleProducts();
            }
            renderProducts(products);
        })
        .catch((error) => {
            console.error('Error loading products:', error);
            loadSampleProducts();
            renderProducts(products);
        });
}

function loadSampleProducts() {
    products = [
        {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            price: 59.99,
            originalPrice: 79.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            description: 'High-quality wireless headphones with noise cancellation feature.',
            discount: 25
        },
        {
            id: 2,
            name: 'Smart Watch Series 5',
            price: 199.99,
            originalPrice: 249.99,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w-400',
            description: 'Advanced smart watch with health monitoring features.',
            discount: 20
        },
        {
            id: 3,
            name: 'Premium Cotton T-Shirt',
            price: 24.99,
            originalPrice: 34.99,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w-400',
            description: '100% cotton premium quality t-shirt.',
            discount: 28
        },
        {
            id: 4,
            name: 'Organic Coffee Beans',
            price: 14.99,
            originalPrice: 19.99,
            category: 'Grocery',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w-400',
            description: 'Premium organic coffee beans from Ethiopia.',
            discount: 25
        },
        {
            id: 5,
            name: 'Smartphone X Pro',
            price: 899.99,
            originalPrice: 999.99,
            category: 'Mobile',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w-400',
            description: 'Latest smartphone with advanced camera features.',
            discount: 10
        },
        {
            id: 6,
            name: 'Leather Wallet',
            price: 39.99,
            originalPrice: 49.99,
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w-400',
            description: 'Genuine leather wallet with multiple compartments.',
            discount: 20
        }
    ];
}

function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                    <span class="discount-badge">-${product.discount}%</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-buy" onclick="buyNow(${product.id})">
                        <i class="fas fa-bolt"></i> Buy Now
                    </button>
                </div>
            </div>
        `;
        
        productCard.addEventListener('click', (e) => {
            if (!e.target.closest('.product-actions')) {
                showProductDetails(product);
            }
        });
        
        productGrid.appendChild(productCard);
    });
}

function showProductDetails(product) {
    const modalContent = document.getElementById('productModalContent');
    modalContent.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-modal-image"
             onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'">
        <div class="modal-product-info">
            <h3>${product.name}</h3>
            <div class="modal-product-price">$${product.price.toFixed(2)}</div>
            <p class="modal-product-description">${product.description}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <div class="modal-actions">
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn-buy" onclick="buyNow(${product.id})">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
        </div>
    `;
    productModal.style.display = 'block';
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    renderCart();
    showMessage('Product added to cart!', 'success');
}

function buyNow(productId) {
    addToCart(productId);
    cartSidebar.classList.add('active');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--dark-gray);">Your cart is empty</p>';
        totalPrice.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                 onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200'">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    totalPrice.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity < 1) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function showCheckoutModal() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    let total = 0;
    let summaryHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summaryHTML += `
            <div class="order-summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    orderSummary.innerHTML = summaryHTML;
    orderTotal.textContent = `$${total.toFixed(2)}`;
    
    checkoutModal.style.display = 'block';
}

function placeOrder() {
    if (!currentUser) {
        showMessage('Please login to place order', 'error');
        loginModal.style.display = 'block';
        checkoutModal.style.display = 'none';
        return;
    }
    
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;
    
    const order = {
        userId: currentUser.uid,
        userName: name,
        userEmail: currentUser.email,
        phone: phone,
        address: address,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        timestamp: Date.now(),
        orderId: 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
    };
    
    // Save order to Firebase
    database.ref('orders/' + order.orderId).set(order)
        .then(() => {
            // Clear form
            checkoutForm.reset();
            checkoutModal.style.display = 'none';
            
            // Show success modal
            document.getElementById('orderId').textContent = order.orderId;
            successModal.style.display = 'block';
            
            // Track conversion in Facebook Pixel
            fbq('track', 'Purchase', {
                value: order.total,
                currency: 'USD',
                content_ids: cart.map(item => item.id),
                content_type: 'product'
            });
        })
        .catch((error) => {
            showMessage('Error placing order: ' + error.message, 'error');
        });
}

function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    renderProducts(filteredProducts);
}

function filterProductsByCategory(category) {
    const filteredProducts = products.filter(product => 
        product.category === category
    );
    
    renderProducts(filteredProducts);
}

function sortProducts() {
    const sortValue = sortSelect.value;
    let sortedProducts = [...products];
    
    switch(sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Keep original order
            break;
    }
    
    renderProducts(sortedProducts);
}

function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `message-${type}`;
    
    setTimeout(() => {
        authMessage.textContent = '';
        authMessage.className = '';
    }, 3000);
}
