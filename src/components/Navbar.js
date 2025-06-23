import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaSearch,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm px-6 py-3 space-y-2">
      {/* Top Row: Logo, Search, Icons */}
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

        {/* Icons with Tooltip (shown below) */}
        <div className="flex gap-6 text-gray-700 text-lg">
          <div className="relative group flex flex-col items-center">
            <FaHeart className="cursor-pointer" />
            <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Wishlist
            </span>
          </div>

          <Link to="/login" className="relative group flex flex-col items-center">
            <FaUser className="cursor-pointer" />
            <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Login to your account
            </span>
          </Link>

          <div className="relative group flex flex-col items-center">
            <FaShoppingBag className="cursor-pointer" />
            <span className="absolute top-8 scale-0 group-hover:scale-100 transition bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              Cart Items
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Menu */}
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

export default Navbar;
