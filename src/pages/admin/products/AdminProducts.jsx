import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { Link } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavbar";
import toast, { Toaster } from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("productId");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const sortedProducts = [...products].sort((a, b) => {
    const fieldA = a[sortField]?.toString().toLowerCase() || "";
    const fieldB = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? fieldA.localeCompare(fieldB)
      : fieldB.localeCompare(fieldA);
  });

  const filteredProducts = sortedProducts.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.productId?.toLowerCase().includes(search) ||
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.price?.toString().includes(search)
    );
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBatchDelete = async () => {
    if (selected.length === 0) return toast.error("No products selected");
    const confirm = window.confirm("Delete selected products?");
    if (!confirm) return;

    try {
      await Promise.all(
        selected.map((id) => deleteDoc(doc(db, "products", id)))
      );
      setProducts(products.filter((p) => !selected.includes(p.id)));
      setSelected([]);
      toast.success("Selected products deleted");
    } catch (error) {
      console.error("Batch delete error:", error);
      toast.error("Batch delete failed");
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentIds = paginatedProducts.map((p) => p.id);
    const allSelected = currentIds.every((id) => selected.includes(id));
    setSelected(allSelected ? selected.filter((id) => !currentIds.includes(id)) : [...new Set([...selected, ...currentIds])]);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <AdminNavbar />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <Link
            to="/admin/products/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + Add Product
          </Link>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by ID, Name, Price, or Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded"
          />
          {selected.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Selected ({selected.length})
            </button>
          )}
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selected.includes(p.id))
                    }
                  />
                </th>
                {["productId", "name", "price", "category"].map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 cursor-pointer hover:underline"
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </th>
                ))}
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(product.id)}
                        onChange={() => handleSelect(product.id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {product.productId || product.id}
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
