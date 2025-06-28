import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import ProductGrid from "../../components/ProductGrid";
import Breadcrumb from "../../components/Breadcrumb";

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const query = new URLSearchParams(location.search).get("q")?.toLowerCase().trim();

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      if (!query) {
        setResults([]);
        setNotFound(true);
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(collection(db, "products"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) =>
          product.name?.toLowerCase().includes(query)
        );

      setResults(filtered);
      setNotFound(filtered.length === 0);
      setLoading(false);
    };

    fetchAndFilterProducts();
  }, [query]);

  return (
    <div className="py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-8">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : notFound ? (
        <p className="text-center text-gray-600">No products found.</p>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
};

export default SearchResults;
