import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import ProductGrid from "../../../components/ProductGrid";
import Breadcrumb from "../../../components/Breadcrumb";

const Shop = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="py-8">
      <Breadcrumb /> {/* Show breadcrumb */}
      <h1 className="text-3xl font-bold text-center mb-8">All Jewellery</h1>
      <ProductGrid products={products} />
    </div>
  );
};

export default Shop;
