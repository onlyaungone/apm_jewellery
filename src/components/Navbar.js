import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart, FaUser, FaShoppingBag, FaSearch, FaSignOutAlt,
  FaLock, FaMapMarkerAlt, FaCreditCard, FaRuler, FaHistory, FaInfoCircle
} from "react-icons/fa";
import { auth, db } from "../utils/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import logo from "../assets/web_logo.png";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchWishlistCount(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchWishlistCount = async (userId) => {
    try {
      const snapshot = await getDocs(collection(db, "users", userId, "wishlist"));
      setWishlistCount(snapshot.size);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const names = snapshot.docs.map((doc) => doc.data().name || "");
      setSuggestions(names);
    };
    fetchSuggestions();
  }, []);

  const matchedSuggestions = suggestions.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 1
  );

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      setSearchTerm("");
      setShowMobileSearch(false); // collapse after search
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-3 space-y-2">
      {/* Top Row */}
      <div className="flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="APM Logo" className="h-20 w-auto" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:block w-1/3 relative">
          <div className="flex items-center gap-2 text-gray-600">
            <FaSearch className="text-sm" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
              className="w-full text-sm focus:outline-none border-b border-gray-300"
            />
          </div>
          {matchedSuggestions.length > 0 && (
            <ul className="absolute top-full mt-1 bg-white border rounded shadow z-50 w-full max-h-40 overflow-y-auto text-sm">
              {matchedSuggestions.slice(0, 5).map((name, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearch(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Icons */}
        <div className="flex gap-6 text-gray-700 text-lg items-center">
          {/* Search Icon for Mobile */}
          <div className="block lg:hidden">
            <FaSearch
              className="cursor-pointer"
              onClick={() => setShowMobileSearch((prev) => !prev)}
            />
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative group flex flex-col items-center">
            <FaHeart className="cursor-pointer" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User */}
          {!user ? (
            <Link to="/login" className="relative group flex flex-col items-center">
              <FaUser className="cursor-pointer" />
            </Link>
          ) : (
            <div className="relative group">
              <div className="cursor-pointer"><FaUser /></div>
              <div className="absolute top-8 right-0 w-52 bg-white border shadow-md rounded-md p-2 space-y-2 
                              opacity-0 translate-y-2 invisible 
                              group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible 
                              transition-all duration-300 ease-in-out z-50">
                <MenuItem icon={<FaInfoCircle />} label="My Account" to="/account" />
                <MenuItem icon={<FaUser />} label="My Details" to="/details" />
                <MenuItem icon={<FaHistory />} label="Order History" to="/orders" />
                <MenuItem icon={<FaMapMarkerAlt />} label="My Address Book" to="/address-book" />
                <MenuItem icon={<FaCreditCard />} label="Cards" to="/cards" />
                <MenuItem icon={<FaRuler />} label="Sizes" to="/sizes" />
                <MenuItem icon={<FaLock />} label="Password" to="/password" />
                <MenuItem icon={<FaInfoCircle />} label="Chat" to="/chat" />
                <MenuItem icon={<FaInfoCircle />} label="Contact Us" to="/contact-us" />
                <MenuItem icon={<FaSignOutAlt />} label="Sign Out" onClick={handleLogout} />
              </div>
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative group flex flex-col items-center">
            <FaShoppingBag className="cursor-pointer" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Input */}
      {showMobileSearch && (
        <div className="block lg:hidden mt-2">
          <input
            type="text"
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
            className="w-full border px-4 py-2 rounded text-sm"
          />
          {matchedSuggestions.length > 0 && (
            <ul className="bg-white border rounded shadow z-50 w-full max-h-40 overflow-y-auto text-sm mt-1">
              {matchedSuggestions.slice(0, 5).map((name, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearch(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Category Navigation */}
      <ul className="flex flex-wrap gap-5 text-sm text-gray-800 font-medium justify-center">
        <li><Link to="/shop" className="hover:text-black hover:border-b-2 border-black transition">Shop by</Link></li>
        <li><Link to="/category/charms" className="hover:text-black hover:border-b-2 border-black transition">Charms</Link></li>
        <li><Link to="/category/bracelets" className="hover:text-black hover:border-b-2 border-black transition">Bracelets</Link></li>
        <li><Link to="/category/rings" className="hover:text-black hover:border-b-2 border-black transition">Rings</Link></li>
        <li><Link to="/category/necklaces" className="hover:text-black hover:border-b-2 border-black transition">Necklaces</Link></li>
        <li><Link to="/category/earrings" className="hover:text-black hover:border-b-2 border-black transition">Earrings</Link></li>
      </ul>
    </nav>
  );
};

const MenuItem = ({ icon, label, to, onClick }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    if (onClick) onClick();
  };
  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 text-sm"
    >
      {icon} <span>{label}</span>
    </div>
  );
};

export default Navbar;
