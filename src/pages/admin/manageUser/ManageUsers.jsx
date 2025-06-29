import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import AdminNavbar from "../../../components/AdminNavbar";
import { toast } from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "user"));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      toast.error("Failed to fetch users.");
    }
  };

  const toggleBlockStatus = async (userId, isBlocked) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { isBlocked: !isBlocked });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: !isBlocked } : u))
      );
      toast.success(`User ${!isBlocked ? "blocked" : "unblocked"}`);
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted.");
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
      user.id.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      fullName.includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

        <input
          type="text"
          placeholder="Search by ID, name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full max-w-md"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">User ID</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.isBlocked ? "bg-red-100" : ""}>
                  <td className="py-2 px-4 border">{user.id}</td>
                  <td className="py-2 px-4 border">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border font-semibold">
                    {user.isBlocked ? "Blocked" : "Active"}
                  </td>
                  <td className="py-2 px-4 border space-x-2">
                    <button
                      className={`px-3 py-1 rounded text-white ${
                        user.isBlocked ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      onClick={() => toggleBlockStatus(user.id, user.isBlocked)}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
