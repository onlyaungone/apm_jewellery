import React from "react";
import { Link } from "react-router-dom";

const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
      {products.map((product) => {
        const firstSize = product.sizes?.[0];
        const price = parseFloat(firstSize?.price) || 0;
        const discount = parseFloat(firstSize?.discount) || 0;
        const hasDiscount = discount > 0;
        const finalPrice = (price - (price * discount) / 100).toFixed(2);

        return (
          <Link key={product.id} to={`/product/${product.id}`}>
            <div className="hover:shadow-lg border p-2 rounded">
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
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
