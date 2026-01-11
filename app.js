// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // App State
    const state = {
        user: null,
        cart: [],
        products: [],
        currentCategory: 'all',
        currentProduct: null,
        currentOrder: null
    };

    // DOM Elements
    const elements = {
        // Auth
        authModal: document.getElementById('authModal'),
        authBtn: document.getElementById('authBtn'),
        authText: document.getElementById('authText'),
        loginFormElement: document.getElementById('loginFormElement'),
        registerFormElement: document.getElementById('registerFormElement'),
        authMessage: document.getElementById('authMessage'),
        
        // Tabs
        tabBtns: document.querySelectorAll('.tab-btn'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        
        // Products
        productsContainer: document.getElementById('productsContainer'),
        categoryLinks: document.querySelectorAll('.category-link'),
        mobileCategoryLinks: document.querySelectorAll('.mobile-category-link'),
        
        // Product Modal
        productModal: document.getElementById('productModal'),
        productModalBody: document.getElementById('productModalBody'),
        
        // Order Modal
        orderModal: document.getElementById('orderModal'),
        orderModalBody: document.getElementById('orderModalBody'),
        
        // Cart
        cartBtn: document.getElementById('cartBtn'),
        cartSidebar: document.getElementById('cartSidebar'),
        closeCart: document.getElementById('closeCart'),
        cartItems: document.getElementById('cartItems'),
        emptyCart: document.getElementById('emptyCart'),
        cartFooter: document.getElementById('cartFooter'),
        cartCount: document.getElementById('cartCount'),
        cartTotal: document.getElementById('cartTotal'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        
        // Mobile Menu
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        mobileSideMenu: document.getElementById('mobileSideMenu'),
        closeMobileMenu: document.getElementById('closeMobileMenu'),
        mobileAuthBtn: document.getElementById('mobileAuthBtn'),
        mobileUserName: document.getElementById('mobileUserName'),
        mobileUserEmail: document.getElementById('mobileUserEmail'),
        
        // Search
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        
        // Slider
        slides: document.querySelectorAll('.slide'),
        dots: document.querySelectorAll('.dot'),
        sliderPrev: document.querySelector('.slider-prev'),
        sliderNext: document.querySelector('.slider-next'),
        
        // Close buttons
        closeModalBtns: document.querySelectorAll('.close-modal')
    };

    // Initialize the application
    function init() {
        // Load products
        loadProducts();
        
        // Check authentication state
        checkAuthState();
        
        // Load cart from localStorage or Firebase
        loadCart();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize slider
        initSlider();
    }

    // Product Data
    const productsData = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
            price: 79.99,
            originalPrice: 129.99,
            discount: 38,
            category: "electronics",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.5,
            ratingCount: 234,
            stock: 45,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2K"
        },
        {
            id: 2,
            name: "Smart Fitness Watch",
            description: "Track your fitness goals with this advanced smartwatch. Monitors heart rate, sleep, and has GPS for outdoor activities.",
            price: 149.99,
            originalPrice: 199.99,
            discount: 25,
            category: "electronics",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1579586337278-3f1a6fb3d3e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.3,
            ratingCount: 189,
            stock: 32,
            affiliateLink: "https://www.amazon.com/dp/B07XLW5Y5V"
        },
        {
            id: 3,
            name: "Organic Face Cream",
            description: "Nourish your skin with this organic face cream made from natural ingredients. Suitable for all skin types.",
            price: 29.99,
            originalPrice: 39.99,
            discount: 25,
            category: "health-beauty",
            image: "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.7,
            ratingCount: 312,
            stock: 78,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2L"
        },
        {
            id: 4,
            name: "Men's Casual Shirt",
            description: "Comfortable and stylish casual shirt made from premium cotton. Available in multiple colors and sizes.",
            price: 34.99,
            originalPrice: 49.99,
            discount: 30,
            category: "fashion",
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.2,
            ratingCount: 156,
            stock: 63,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2M"
        },
        {
            id: 5,
            name: "Premium Massage Oil",
            description: "Luxurious massage oil with essential oils for relaxation and stress relief. Perfect for couples.",
            price: 24.99,
            originalPrice: 34.99,
            discount: 29,
            category: "sex-toy",
            image: "https://images.unsplash.com/photo-1601066525718-7bd8c2e1e9d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1601066525718-7bd8c2e1e9d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.6,
            ratingCount: 89,
            stock: 41,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2N"
        },
        {
            id: 6,
            name: "Portable Power Bank",
            description: "10000mAh power bank with fast charging technology. Can charge multiple devices simultaneously.",
            price: 39.99,
            originalPrice: 59.99,
            discount: 33,
            category: "electronics",
            image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1594736797933-d0a5ea3da3d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.4,
            ratingCount: 201,
            stock: 56,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2O"
        },
        {
            id: 7,
            name: "Women's Handbag",
            description: "Elegant leather handbag with multiple compartments. Perfect for everyday use or special occasions.",
            price: 89.99,
            originalPrice: 129.99,
            discount: 31,
            category: "fashion",
            image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.5,
            ratingCount: 178,
            stock: 27,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2P"
        },
        {
            id: 8,
            name: "Essential Oil Diffuser",
            description: "Ultrasonic essential oil diffuser with 7 color changing LED lights. Creates a relaxing atmosphere.",
            price: 32.99,
            originalPrice: 49.99,
            discount: 34,
            category: "health-beauty",
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1583947581924-860bda6a26df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.3,
            ratingCount: 145,
            stock: 38,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2Q"
        },
        {
            id: 9,
            name: "Kitchen Utensil Set",
            description: "15-piece kitchen utensil set made from high-quality stainless steel and silicone. Perfect for every kitchen.",
            price: 49.99,
            originalPrice: 79.99,
            discount: 38,
            category: "others",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.6,
            ratingCount: 267,
            stock: 52,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2R"
        },
        {
            id: 10,
            name: "Yoga Mat Premium",
            description: "Eco-friendly yoga mat with non-slip surface. Includes carrying strap for easy transport.",
            price: 44.99,
            originalPrice: 64.99,
            discount: 31,
            category: "health-beauty",
            image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            rating: 4.7,
            ratingCount: 189,
            stock: 34,
            affiliateLink: "https://www.amazon.com/dp/B07X8V5Y2S"
        }
    ];

    // Load products into state
    function loadProducts() {
        state.products = productsData;
        renderProducts();
    }

    // Render products based on current category
    function renderProducts() {
        elements.productsContainer.innerHTML = '';
        
        let filteredProducts = state.products;
        
        if (state.currentCategory !== 'all') {
            filteredProducts = state.products.filter(product => 
                product.category === state.currentCategory
            );
        }
        
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            elements.productsContainer.appendChild(productCard);
        });
    }

    // Create product card HTML
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        const stars = getStarRating(product.rating);
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.discount ? `<div class="product-badge">-${product.discount}%</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    ${product.discount ? `<span class="discount">-${product.discount}%</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">(${product.ratingCount})</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="btn-buy-now" data-id="${product.id}">Buy Now</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.product-actions')) {
                showProductDetail(product);
            }
        });
        
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product);
        });
        
        const buyNowBtn = card.querySelector('.btn-buy-now');
        buyNowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            buyNow(product);
        });
        
        return card;
    }

    // Get star rating HTML
    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    // Show product detail modal
    function showProductDetail(product) {
        state.currentProduct = product;
        
        const relatedProducts = state.products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        
        const stars = getStarRating(product.rating);
        
        elements.productModalBody.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-images">
                    <div class="product-main-image">
                        <img src="${product.images[0]}" alt="${product.name}" id="mainProductImage">
                    </div>
                    <div class="product-thumbnails">
                        ${product.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <img src="${img}" alt="${product.name}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <div class="product-detail-price">
                        <span class="product-detail-current">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="product-detail-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                        ${product.discount ? `<span class="product-detail-discount">-${product.discount}%</span>` : ''}
                    </div>
                    <div class="product-rating-detail">
                        <div class="stars-detail">${stars}</div>
                        <span>${product.rating} (${product.ratingCount} reviews)</span>
                    </div>
                    <div class="product-description">
                        <p>${product.description}</p>
                    </div>
                    <div class="product-stock">
                        ${product.stock > 0 
                            ? `<span class="stock-in"><i class="fas fa-check-circle"></i> In Stock (${product.stock} available)</span>`
                            : `<span class="stock-out"><i class="fas fa-times-circle"></i> Out of Stock</span>`
                        }
                    </div>
                    <div class="product-detail-actions">
                        <button class="btn-order-now" data-id="${product.id}">Order Now</button>
                        <button class="btn-buy-now-detail" data-id="${product.id}">Buy Now</button>
                    </div>
                    
                    ${relatedProducts.length > 0 ? `
                        <div class="related-products">
                            <h3>Related Products</h3>
                            <div class="related-products-list">
                                ${relatedProducts.map(relatedProduct => `
                                    <div class="related-product-item" data-id="${relatedProduct.id}">
                                        <div class="related-product-image">
                                            <img src="${relatedProduct.image}" alt="${relatedProduct.name}">
                                        </div>
                                        <div class="related-product-info">
                                            <h4 class="related-product-title">${relatedProduct.name}</h4>
                                            <div class="related-product-price">$${relatedProduct.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners for thumbnails
        const thumbnails = elements.productModalBody.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = thumb.dataset.index;
                const mainImage = document.getElementById('mainProductImage');
                mainImage.src = product.images[index];
                
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
        
        // Add event listeners for related products
        const relatedProductItems = elements.productModalBody.querySelectorAll('.related-product-item');
        relatedProductItems.forEach(item => {
            item.addEventListener('click', () => {
                const productId = parseInt(item.dataset.id);
                const relatedProduct = state.products.find(p => p.id === productId);
                if (relatedProduct) {
                    showProductDetail(relatedProduct);
                }
            });
        });
        
        // Add event listeners for action buttons
        const orderNowBtn = elements.productModalBody.querySelector('.btn-order-now');
        orderNowBtn.addEventListener('click', () => {
            showOrderModal(product);
        });
        
        const buyNowDetailBtn = elements.productModalBody.querySelector('.btn-buy-now-detail');
        buyNowDetailBtn.addEventListener('click', () => {
            buyNow(product);
        });
        
        // Show modal
        elements.productModal.classList.add('active');
    }

    // Show order modal
    function showOrderModal(product = null) {
        let orderProducts = [];
        let total = 0;
        
        if (product) {
            // Single product order
            orderProducts = [{
                ...product,
                quantity: 1
            }];
            total = product.price;
        } else {
            // Cart order
            orderProducts = state.cart;
            total = calculateCartTotal();
        }
        
        elements.orderModalBody.innerHTML = `
            <div class="order-form">
                <h3>Place Your Order</h3>
                
                <div class="order-summary">
                    <h4>Order Summary</h4>
                    ${orderProducts.map(item => `
                        <div class="order-summary-item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="order-summary-total">
                        <span>Total Amount:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="order-details">
                    <h4>Shipping Details</h4>
                    <div class="form-group">
                        <label for="orderName">Full Name</label>
                        <input type="text" id="orderName" placeholder="Enter your full name" value="${state.user ? state.user.displayName || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label for="orderEmail">Email Address</label>
                        <input type="email" id="orderEmail" placeholder="Enter your email" value="${state.user ? state.user.email || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label for="orderPhone">Phone Number</label>
                        <input type="tel" id="orderPhone" placeholder="Enter your phone number">
                    </div>
                    <div class="form-group">
                        <label for="orderAddress">Shipping Address</label>
                        <textarea id="orderAddress" rows="3" placeholder="Enter your complete shipping address"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="orderNotes">Order Notes (Optional)</label>
                        <textarea id="orderNotes" rows="2" placeholder="Any special instructions for your order"></textarea>
                    </div>
                </div>
                
                <button class="btn-place-order" id="placeOrderBtn">Place Order</button>
            </div>
        `;
        
        // Add event listener for place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.addEventListener('click', placeOrder);
        
        // Show modal
        elements.orderModal.classList.add('active');
    }

    // Place order function
    function placeOrder() {
        const name = document.getElementById('orderName').value;
        const email = document.getElementById('orderEmail').value;
        const phone = document.getElementById('orderPhone').value;
        const address = document.getElementById('orderAddress').value;
        const notes = document.getElementById('orderNotes').value;
        
        // Validation
        if (!name || !email || !phone || !address) {
            showAuthMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Create order object
        const order = {
            userId: state.user ? state.user.uid : 'guest',
            userName: name,
            userEmail: email,
            userPhone: phone,
            shippingAddress: address,
            orderNotes: notes,
            products: state.currentProduct 
                ? [{...state.currentProduct, quantity: 1}]
                : state.cart,
            total: state.currentProduct 
                ? state.currentProduct.price 
                : calculateCartTotal(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save order to Firebase
        if (state.user) {
            const orderRef = database.ref('orders').push();
            orderRef.set(order)
                .then(() => {
                    showAuthMessage('Order placed successfully! We will contact you soon.', 'success');
                    
                    // Clear cart if order was from cart
                    if (!state.currentProduct) {
                        clearCart();
                    }
                    
                    // Close modal after delay
                    setTimeout(() => {
                        elements.orderModal.classList.remove('active');
                        state.currentProduct = null;
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error saving order:', error);
                    showAuthMessage('Failed to place order. Please try again.', 'error');
                });
        } else {
            // For guest users, store in localStorage
            const orders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            orders.push(order);
            localStorage.setItem('guestOrders', JSON.stringify(orders));
            
            showAuthMessage('Order placed successfully! We will contact you soon.', 'success');
            
            // Clear cart if order was from cart
            if (!state.currentProduct) {
                clearCart();
            }
            
            // Close modal after delay
            setTimeout(() => {
                elements.orderModal.classList.remove('active');
                state.currentProduct = null;
            }, 2000);
        }
    }

    // Buy now function (redirects to affiliate link)
    function buyNow(product) {
        // Open affiliate link in new tab
        window.open(product.affiliateLink, '_blank');
    }

    // Cart functions
    function addToCart(product) {
        const existingItem = state.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            state.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCart();
        saveCart();
        showNotification(`${product.name} added to cart`);
    }

    function removeFromCart(productId) {
        state.cart = state.cart.filter(item => item.id !== productId);
        updateCart();
        saveCart();
    }

    function updateCart() {
        // Update cart count
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        
        // Update cart UI
        if (state.cart.length === 0) {
            elements.emptyCart.style.display = 'block';
            elements.cartFooter.style.display = 'none';
            elements.cartItems.innerHTML = '';
            elements.cartItems.appendChild(elements.emptyCart);
        } else {
            elements.emptyCart.style.display = 'none';
            elements.cartFooter.style.display = 'block';
            
            elements.cartItems.innerHTML = '';
            
            state.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `;
                
                elements.cartItems.appendChild(cartItem);
            });
            
            // Add event listeners for quantity controls
            const decreaseBtns = elements.cartItems.querySelectorAll('.decrease');
            decreaseBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.id);
                    updateCartItemQuantity(productId, -1);
                });
            });
            
            const increaseBtns = elements.cartItems.querySelectorAll('.increase');
            increaseBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.id);
                    updateCartItemQuantity(productId, 1);
                });
            });
            
            const removeBtns = elements.cartItems.querySelectorAll('.remove-item');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.dataset.id);
                    removeFromCart(productId);
                });
            });
            
            // Update total
            elements.cartTotal.textContent = `$${calculateCartTotal().toFixed(2)}`;
        }
    }

    function updateCartItemQuantity(productId, change) {
        const item = state.cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCart();
                saveCart();
            }
        }
    }

    function calculateCartTotal() {
        return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function saveCart() {
        if (state.user) {
            // Save to Firebase
            const cartRef = database.ref(`carts/${state.user.uid}`);
            cartRef.set(state.cart)
                .catch(error => {
                    console.error('Error saving cart to Firebase:', error);
                    // Fallback to localStorage
                    localStorage.setItem(`cart_${state.user.uid}`, JSON.stringify(state.cart));
                });
        } else {
            // Save to localStorage for guest users
            localStorage.setItem('guest_cart', JSON.stringify(state.cart));
        }
    }

    function loadCart() {
        if (state.user) {
            // Load from Firebase
            const cartRef = database.ref(`carts/${state.user.uid}`);
            cartRef.once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        state.cart = snapshot.val();
                    } else {
                        // Try loading from localStorage as fallback
                        const savedCart = localStorage.getItem(`cart_${state.user.uid}`);
                        state.cart = savedCart ? JSON.parse(savedCart) : [];
                    }
                    updateCart();
                })
                .catch(error => {
                    console.error('Error loading cart from Firebase:', error);
                    // Fallback to localStorage
                    const savedCart = localStorage.getItem(`cart_${state.user.uid}`);
                    state.cart = savedCart ? JSON.parse(savedCart) : [];
                    updateCart();
                });
        } else {
            // Load from localStorage for guest users
            const savedCart = localStorage.getItem('guest_cart');
            state.cart = savedCart ? JSON.parse(savedCart) : [];
            updateCart();
        }
    }

    function clearCart() {
        state.cart = [];
        updateCart();
        saveCart();
    }

    // Authentication functions
    function checkAuthState() {
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                state.user = user;
                elements.authText.textContent = user.displayName || 'My Account';
                elements.mobileUserName.textContent = user.displayName || 'My Account';
                elements.mobileUserEmail.textContent = user.email;
                
                // Load user's cart
                loadCart();
            } else {
                // User is signed out
                state.user = null;
                elements.authText.textContent = 'Login / Register';
                elements.mobileUserName.textContent = 'Welcome to New Journey Shop';
                elements.mobileUserEmail.textContent = 'Login to access your account';
                
                // Load guest cart
                loadCart();
            }
        });
    }

    function login(email, password) {
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                showAuthMessage('Login successful!', 'success');
                elements.authModal.classList.remove('active');
            })
            .catch(error => {
                console.error('Login error:', error);
                showAuthMessage(getAuthErrorMessage(error.code), 'error');
            });
    }

    function register(name, email, password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Update user profile with name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                showAuthMessage('Registration successful!', 'success');
                // Switch to login tab
                switchAuthTab('login');
            })
            .catch(error => {
                console.error('Registration error:', error);
                showAuthMessage(getAuthErrorMessage(error.code), 'error');
            });
    }

    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Email already in use. Please try another email.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/weak-password':
                return 'Password is too weak. Please use at least 6 characters.';
            case 'auth/user-not-found':
                return 'User not found. Please check your email.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            default:
                return 'An error occurred. Please try again.';
        }
    }

    function showAuthMessage(message, type) {
        elements.authMessage.textContent = message;
        elements.authMessage.className = `auth-message ${type}`;
        
        // Clear message after 5 seconds
        setTimeout(() => {
            elements.authMessage.textContent = '';
            elements.authMessage.className = 'auth-message';
        }, 5000);
    }

    function switchAuthTab(tab) {
        // Update tab buttons
        elements.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update forms
        if (tab === 'login') {
            elements.loginForm.classList.add('active');
            elements.registerForm.classList.remove('active');
        } else {
            elements.loginForm.classList.remove('active');
            elements.registerForm.classList.add('active');
        }
    }

    // Slider functions
    function initSlider() {
        let currentSlide = 0;
        const totalSlides = elements.slides.length;
        
        function showSlide(index) {
            // Update slides
            elements.slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            // Update dots
            elements.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
        }
        
        function nextSlide() {
            const nextIndex = (currentSlide + 1) % totalSlides;
            showSlide(nextIndex);
        }
        
        function prevSlide() {
            const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(prevIndex);
        }
        
        // Auto slide every 5 seconds
        let slideInterval = setInterval(nextSlide, 5000);
        
        // Pause auto-slide on hover
        const slider = document.querySelector('.hero-slider');
        slider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Event listeners for controls
        elements.sliderNext.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        elements.sliderPrev.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Event listeners for dots
        elements.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(slideInterval);
                showSlide(index);
                slideInterval = setInterval(nextSlide, 5000);
            });
        });
    }

    // Notification function
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Set up event listeners
    function setupEventListeners() {
        // Auth modal
        elements.authBtn.addEventListener('click', () => {
            elements.authModal.classList.add('active');
        });
        
        elements.mobileAuthBtn.addEventListener('click', () => {
            elements.authModal.classList.add('active');
            elements.mobileSideMenu.classList.remove('active');
        });
        
        // Tab switching
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchAuthTab(btn.dataset.tab);
            });
        });
        
        // Login form
        elements.loginFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
        
        // Register form
        elements.registerFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAuthMessage('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showAuthMessage('Password must be at least 6 characters', 'error');
                return;
            }
            
            register(name, email, password);
        });
        
        // Category filtering
        elements.categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                elements.categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update current category
                state.currentCategory = link.dataset.category;
                renderProducts();
            });
        });
        
        // Mobile category filtering
        elements.mobileCategoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                elements.mobileCategoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update current category
                state.currentCategory = link.dataset.category;
                renderProducts();
                
                // Close mobile menu
                elements.mobileSideMenu.classList.remove('active');
            });
        });
        
        // Cart
        elements.cartBtn.addEventListener('click', () => {
            elements.cartSidebar.classList.add('active');
        });
        
        elements.closeCart.addEventListener('click', () => {
            elements.cartSidebar.classList.remove('active');
        });
        
        elements.checkoutBtn.addEventListener('click', () => {
            if (state.cart.length === 0) {
                showNotification('Your cart is empty');
                return;
            }
            
            showOrderModal();
            elements.cartSidebar.classList.remove('active');
        });
        
        // Mobile menu
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.mobileSideMenu.classList.add('active');
        });
        
        elements.closeMobileMenu.addEventListener('click', () => {
            elements.mobileSideMenu.classList.remove('active');
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
        
        // Close modals with close buttons
        elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });
        
        // Search
        elements.searchBtn.addEventListener('click', performSearch);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // View all products
        document.getElementById('viewAll').addEventListener('click', (e) => {
            e.preventDefault();
            state.currentCategory = 'all';
            
            // Update active states
            elements.categoryLinks.forEach(l => l.classList.remove('active'));
            elements.categoryLinks[0].classList.add('active');
            
            elements.mobileCategoryLinks.forEach(l => l.classList.remove('active'));
            elements.mobileCategoryLinks[0].classList.add('active');
            
            renderProducts();
        });
        
        // Shop now buttons
        document.querySelectorAll('.btn-shop-now').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentCategory = 'all';
                renderProducts();
                
                // Scroll to products
                document.querySelector('.products-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // App download buttons
        document.querySelectorAll('.btn-app').forEach(btn => {
            btn.addEventListener('click', () => {
                showNotification('App download link will be available soon!');
            });
        });
        
        // Social links
        document.querySelectorAll('.social-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Social media page will open in a real application!');
            });
        });
    }

    // Search function
    function performSearch() {
        const query = elements.searchInput.value.trim().toLowerCase();
        
        if (!query) return;
        
        const filteredProducts = state.products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
        
        if (filteredProducts.length === 0) {
            showNotification('No products found for your search');
            return;
        }
        
        // Clear products container
        elements.productsContainer.innerHTML = '';
        
        // Render filtered products
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            elements.productsContainer.appendChild(productCard);
        });
        
        // Update section header
        document.querySelector('.section-header h2').textContent = `Search Results for "${query}"`;
        
        // Clear search input
        elements.searchInput.value = '';
        
        // Scroll to products
        document.querySelector('.products-section').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // Initialize the app
    init();
});
