import React from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

// Helper to check if today is within the promo period
const isWithinPromo = (promoStart, promoEnd) => {
  if (!promoStart || !promoEnd) return false;
  const today = new Date();
  const start = new Date(promoStart);
  const end = new Date(promoEnd);
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return today >= start && today <= end;
};

const ProductGrid = ({ products, showHeart = false, onToggleWishlist }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
      {products.map((product) => {
        const firstSize = product.sizes?.[0];
        const price = parseFloat(firstSize?.price) || 0;
        const discount = parseFloat(firstSize?.discount) || 0;

        const promoActive = isWithinPromo(product.promoStart, product.promoEnd);
        const hasDiscount = promoActive && discount > 0;
        const finalPrice = hasDiscount
          ? (price - (price * discount) / 100).toFixed(2)
          : price.toFixed(2);

        return (
          <div key={product.id} className="relative hover:shadow-lg border p-2 rounded">
            {/* Heart Icon (if enabled) */}
            {showHeart && onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow hover:scale-110 transition z-10"
                title={product.isWished ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {product.isWished ? (
                  <AiFillHeart className="text-red-500 text-lg" />
                ) : (
                  <AiOutlineHeart className="text-gray-500 text-lg" />
                )}
              </button>
            )}

            {/* Product Link */}
            <Link to={`/product/${product.id}`}>
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-full"
              />
              <p className="mt-2 font-medium text-sm">{product.name}</p>

              {firstSize && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {hasDiscount ? (
                    <>
                      <span className="text-red-600 font-semibold text-sm">
                        A${finalPrice}
                      </span>
                      <span className="line-through text-black text-sm">
                        A${price.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        SAVE {discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-black font-semibold text-sm">
                      A${price.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
