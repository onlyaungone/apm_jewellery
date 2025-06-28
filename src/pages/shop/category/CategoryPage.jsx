import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import ProductGrid from "../../../components/ProductGrid";
import Breadcrumb from "../../../components/Breadcrumb";

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const CategoryPage = () => {
  const { type } = useParams();
  const category = capitalize(type);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.category?.toLowerCase() === type.toLowerCase());

      setProducts(filtered);
    };

    fetchCategoryProducts();
  }, [type]);

  return (
    <div className="py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-8">{category}</h1>
      <ProductGrid products={products} />
      {products.length === 0 && (
        <p className="text-center text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
