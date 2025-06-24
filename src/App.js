import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import MyAccount from "./pages/MyAccount";
import MyDetails from "./pages/MyDetails";
import ChangePassword from "./pages/ChangePassword";
import AddressBook from "./pages/AddressBook";
import AddAddress from "./pages/AddAddress";
import EditAddress from "./pages/EditAddress";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <h2 className="text-white text-4xl font-bold">Welcome to APM Jewellery 💎</h2>
            </div>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/details" element={<MyDetails />} />
        <Route path="/password" element={<ChangePassword />} />
        <Route path="/address-book" element={<AddressBook />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/edit-address/:id" element={<EditAddress />} />
      </Routes>
    </Router>
  );
}

export default App;
