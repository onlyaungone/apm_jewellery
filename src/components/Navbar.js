import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaSignOutAlt,
  FaLock,
  FaMapMarkerAlt,
  FaCreditCard,
  FaRuler,
  FaHistory,
  FaInfoCircle,
} from "react-icons/fa";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-3 space-y-2">
      {/* Top Row */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-semibold tracking-wide">
          APM
        </Link>

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 text-gray-600">
          <FaSearch className="text-sm" />
          <input
            type="text"
            placeholder="Search"
            className="text-sm focus:outline-none border-b border-gray-300"
          />
        </div>

        {/* Icons */}
        <div className="flex gap-6 text-gray-700 text-lg">
          {/* Wishlist */}
          <div className="relative group flex flex-col items-center">
            <FaHeart className="cursor-pointer" />
            <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Wishlist
            </span>
          </div>

          {/* User Dropdown */}
          {!user ? (
            <Link to="/login" className="relative group flex flex-col items-center">
              <FaUser className="cursor-pointer" />
              <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Login to your account
              </span>
            </Link>
          ) : (
            <div className="relative group">
              <div className="cursor-pointer">
                <FaUser />
              </div>
              <div
                className="absolute top-8 right-0 w-52 bg-white border shadow-md rounded-md p-2 space-y-2 
                           opacity-0 translate-y-2 invisible 
                           group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible 
                           transition-all duration-300 ease-in-out z-50"
              >
                <MenuItem icon={<FaInfoCircle />} label="My Account" to="/account" />
                <MenuItem icon={<FaUser />} label="My Details" to="/details" />
                <MenuItem icon={<FaHistory />} label="Order History" />
                <MenuItem icon={<FaMapMarkerAlt />} label="My Address Book" to="/address-book" />
                <MenuItem icon={<FaCreditCard />} label="Cards" />
                <MenuItem icon={<FaRuler />} label="Sizes" />
                <MenuItem icon={<FaLock />} label="Password" to="/password" />
                <MenuItem icon={<FaSignOutAlt />} label="Sign Out" onClick={handleLogout} />
              </div>
            </div>
          )}

          {/* Cart */}
          <div className="relative group flex flex-col items-center">
            <FaShoppingBag className="cursor-pointer" />
            <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Cart Items
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <ul className="flex flex-wrap gap-5 text-sm text-gray-800 font-medium justify-center">
        <li><Link to="#">New & featured</Link></li>
        <li><Link to="#">Shop by</Link></li>
        <li><Link to="#">Charms</Link></li>
        <li><Link to="#">Bracelets</Link></li>
        <li><Link to="#">Rings</Link></li>
        <li><Link to="#">Necklaces</Link></li>
        <li><Link to="#">Earrings</Link></li>
        <li><Link to="#">Engraving</Link></li>
        <li><Link to="#">Gifts</Link></li>
        <li><Link to="#">Collections</Link></li>
        <li>
          <Link to="#" className="border-b-2 border-black">
            Lab-grown diamonds
          </Link>
        </li>
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
