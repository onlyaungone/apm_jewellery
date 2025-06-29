import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";

// Auth
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Shared
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";

// Customer Account
import MyAccount from "./pages/account/userInfo/MyAccount";
import MyDetails from "./pages/account/userInfo/MyDetails";
import ChangePassword from "./pages/account/userInfo/ChangePassword";
import AddressBook from "./pages/account/address/AddressBook";
import AddAddress from "./pages/account/address/AddAddress";
import EditAddress from "./pages/account/address/EditAddress";
import Sizes from "./pages/account/userInfo/Sizes";
import Cards from "./pages/account/userInfo/Cards";
import ContactUs from "./pages/account/userActions/ContactUs";
import OrdersPage from "./pages/account/userOrders/OrderHistory";
import UserOrderDetails from "./pages/account/userOrders/UserOrderDetails";

// Admin
import AdminDashboard from "./pages/admin/profile/AdminDashboard";
import AdminChangePassword from "./pages/admin/profile/AdminChangePassword";
import ManageUsers from "./pages/admin/manageUser/ManageUsers";
import AdminReports from "./pages/admin/orderReports/AdminReports";
import AdminEnquiriesDashboard from "./pages/admin/enquiries/AdminEnquiriesDashboard";
import AdminEnquiryDetail from "./pages/admin/enquiries/AdminEnquiryDetail";

// Admin Products
import AdminProducts from "./pages/admin/products/AdminProducts";
import AddProduct from "./pages/admin/products/AddProduct";
import EditProduct from "./pages/admin/products/EditProduct";
import ManageOrders from "./pages/admin/orders/ManageOrders";
import ViewOrderDetails from "./pages/admin/orders/ViewOrderDetails";
import ConfirmedOrders from "./pages/admin/orders/ConfirmedOrders";
import DeclinedOrders from "./pages/admin/orders/DeclinedOrders";


// Shop
import HomePage from "./pages/HomePage";
import Shop from "./pages/shop/category/Shop";
import CategoryPage from "./pages/shop/category/CategoryPage";
import ProductDetail from "./pages/shop/ProductDetail";
import WishLists from "./pages/account/userActions/WishLists";
import CartPage from "./pages/shop/CartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import SearchResults from "./pages/shop/SearchResults";

// Chat Feature
import ChatUser from "./pages/account/userActions/ChatUser";
import ChatAdmin from "./pages/admin/manageUser/ChatAdmin";

function App() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Firebase auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Logged in user:", user.email);
      } else {
        console.log("❌ No user logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  // Admin auto-redirect from root
  useEffect(() => {
    if (!loading && currentUser?.role === "admin" && location.pathname === "/") {
      navigate("/admin");
    }
  }, [loading, currentUser, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading user info...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:type" element={<CategoryPage />} />
        <Route path="/wishlist" element={<WishLists />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<UserOrderDetails />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Product Detail */}
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Customer Account */}
        <Route path="/account" element={<MyAccount />} />
        <Route path="/details" element={<MyDetails />} />
        <Route path="/password" element={<ChangePassword />} />
        <Route path="/address-book" element={<AddressBook />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/edit-address/:id" element={<EditAddress />} />
        <Route path="/sizes" element={<Sizes />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/chat" element={<ChatUser />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={currentUser?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route path="/admin/admin-change-password" element={<AdminChangePassword />} />
        <Route
          path="/admin/products"
          element={currentUser?.role === "admin" ? <AdminProducts /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/products/add"
          element={currentUser?.role === "admin" ? <AddProduct /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/products/edit/:id"
          element={currentUser?.role === "admin" ? <EditProduct /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/orders"
          element={currentUser?.role === "admin" ? <ManageOrders /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/orders/:id"
          element={currentUser?.role === "admin" ? <ViewOrderDetails /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/orders/confirmed"
          element={currentUser?.role === "admin" ? <ConfirmedOrders /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/orders/declined"
          element={currentUser?.role === "admin" ? <DeclinedOrders /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/users"
          element={currentUser?.role === "admin" ? <ManageUsers /> : <Navigate to="/" />}
        />
        <Route path="/admin/reports" 
        element={currentUser?.role === "admin" ? <AdminReports /> : <Navigate to="/" />} 
        />
        <Route path="/admin/enquiries" element={<AdminEnquiriesDashboard />} />
        <Route path="/admin/enquiries/:id" element={<AdminEnquiryDetail />} />
        <Route
          path="/admin/chat"
          element={currentUser?.role === "admin" ? <ChatAdmin /> : <Navigate to="/" />}
        />
      </Routes>

      {/* Footer */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
