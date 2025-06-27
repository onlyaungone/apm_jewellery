import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaPinterest,
} from "react-icons/fa6";
import logo from "../assets/web_logo.png";
import auFlag from "../assets/au_flag.png";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-6 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-800">
      {/* Left: Logo */}
      <div className="flex-shrink-0 mb-4 md:mb-0">
        <img src={logo} alt="APM Logo" className="h-20" />
      </div>

      {/* Center: Text */}
      <div className="flex items-center gap-2 flex-wrap justify-center text-center text-sm text-gray-800">
        <div className="flex items-center gap-1">
          <img src={auFlag} alt="Australia" className="h-4 w-6 object-cover" />
          <span>AUSTRALIA</span>
        </div>
        <span>English</span>
        <span>© ALL RIGHTS RESERVED. 2025 APM</span>
      </div>

      {/* Right: Social Icons */}
      <div className="flex gap-3 mt-4 md:mt-0">
        <SocialIcon Icon={FaFacebookF} />
        <SocialIcon Icon={FaInstagram} />
        <SocialIcon Icon={FaXTwitter} />
        <SocialIcon Icon={FaYoutube} />
        <SocialIcon Icon={FaTiktok} />
        <SocialIcon Icon={FaPinterest} />
      </div>
    </footer>
  );
};

const SocialIcon = ({ Icon }) => (
  <div className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition">
    <Icon className="text-sm" />
  </div>
);

export default Footer;
