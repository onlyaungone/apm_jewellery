import React, { useState } from "react";
import { FaUser, FaSignOutAlt, FaLock, FaMapMarkerAlt, FaCreditCard, FaRuler, FaHistory, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="relative group">
      <FaUser className="text-xl cursor-pointer" />
      <div className="absolute top-8 right-0 w-52 bg-white border shadow-md rounded-md p-2 space-y-2 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition duration-200 z-50">
        <MenuItem icon={<FaInfoCircle />} label="My Account" />
        <MenuItem icon={<FaUser />} label="My Details" />
        <MenuItem icon={<FaHistory />} label="Order History" />
        <MenuItem icon={<FaMapMarkerAlt />} label="My Address Book" />
        <MenuItem icon={<FaCreditCard />} label="Cards" />
        <MenuItem icon={<FaRuler />} label="Sizes" />
        <MenuItem icon={<FaLock />} label="Password" />
        <MenuItem icon={<FaSignOutAlt />} label="Sign Out" onClick={handleLogout} />
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 text-sm"
  >
    {icon} <span>{label}</span>
  </div>
);

export default UserMenu;
