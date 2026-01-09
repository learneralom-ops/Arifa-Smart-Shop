// firebase.js

// Firebase configuration
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

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore collections
const usersCollection = db.collection("users");
const productsCollection = db.collection("products");
const categoriesCollection = db.collection("categories");
const cartsCollection = db.collection("carts");
const ordersCollection = db.collection("orders");
const bannersCollection = db.collection("banners");

// Current user state
let currentUser = null;
let isAdmin = false;

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    checkAdminStatus(user.uid);
    updateUIForLoggedInUser(user);
  } else {
    currentUser = null;
    isAdmin = false;
    updateUIForLoggedOutUser();
  }
});

// Check if user is admin
async function checkAdminStatus(uid) {
  try {
    const userDoc = await usersCollection.doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData.role === "admin";
      updateAdminUI(isAdmin);
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
  const userNameElement = document.getElementById("userName");
  const userAccountElement = document.getElementById("userAccount");
  
  if (userNameElement) {
    // Get display name or email
    const displayName = user.displayName || user.email.split('@')[0];
    userNameElement.textContent = displayName;
  }
  
  if (userAccountElement) {
    userAccountElement.innerHTML = `
      <i class="fas fa-user-circle"></i>
      <span id="userName">${user.displayName || user.email.split('@')[0]}</span>
      <div class="dropdown" id="accountDropdown">
        <a href="#" id="myProfileBtn">My Profile</a>
        <a href="#" id="myOrdersBtn">My Orders</a>
        <a href="#" id="logoutBtn">Logout</a>
        ${isAdmin ? '<a href="#" id="adminLoginBtn" class="admin-only">Admin Panel</a>' : ''}
      </div>
    `;
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  const userNameElement = document.getElementById("userName");
  const userAccountElement = document.getElementById("userAccount");
  
  if (userNameElement) {
    userNameElement.textContent = "Account";
  }
  
  if (userAccountElement) {
    userAccountElement.innerHTML = `
      <i class="fas fa-user-circle"></i>
      <span id="userName">Account</span>
      <div class="dropdown" id="accountDropdown">
        <a href="#" id="loginBtn">Login</a>
        <a href="#" id="registerBtn">Register</a>
      </div>
    `;
  }
}

// Update admin UI
function updateAdminUI(isAdminUser) {
  const adminElements = document.querySelectorAll(".admin-only");
  adminElements.forEach(element => {
    element.style.display = isAdminUser ? "block" : "none";
  });
}

// Export Firebase services
export { 
  auth, 
  db, 
  storage, 
  usersCollection, 
  productsCollection, 
  categoriesCollection,
  cartsCollection,
  ordersCollection,
  bannersCollection,
  currentUser,
  isAdmin
};
