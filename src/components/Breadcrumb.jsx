import React from "react";
import { Link, useLocation } from "react-router-dom";

const capitalize = (str) =>
  str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="text-sm text-gray-600 px-6 py-4">
      <nav className="flex flex-wrap items-center space-x-2">
        <Link to="/" className="hover:underline font-bold text-black">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:underline text-black">Shop by</Link>

        {pathnames.map((segment, index) => {
          const isLast = index === pathnames.length - 1;
          const to = "/" + pathnames.slice(0, index + 1).join("/");

          return (
            <React.Fragment key={to}>
              <span>/</span>
              {segment.toLowerCase() === "category" ? (
                <span className="text-black font-medium">Category</span> // 🔒 Not a link
              ) : isLast ? (
                <span className="text-gray-800 font-medium">{capitalize(segment)}</span>
              ) : (
                <Link to={to} className="hover:underline">{capitalize(segment)}</Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumb;
