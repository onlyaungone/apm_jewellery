import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadGoogleMapsScript } from "../../../utils/loadGoogleMaps";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../utils/firebaseConfig";

const EditAddress = () => {
  const { id } = useParams(); // address document ID
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const dummyMap = useRef(null);

  const [formData, setFormData] = useState({
    addressTitle: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    suburb: "",
    town: "",
    postalCode: "",
    country: "Australia",
    phone: "",
  });

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const docRef = doc(db, "users", user.uid, "addresses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else {
        alert("Address not found.");
        navigate("/address-book");
      }
    };

    init();
    loadGoogleMapsScript();

    const interval = setInterval(() => {
      if (window.google && !autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        dummyMap.current = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(dummyMap.current);
        clearInterval(interval);
      }
    }, 500);
  }, [id, navigate]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address1: value }));

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input: value, componentRestrictions: { country: "au" } },
        (preds) => setPredictions(preds || [])
      );
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = (description, placeId) => {
    if (!placesService.current || !placeId) return;

    placesService.current.getDetails({ placeId }, (place, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;

      const getComponent = (type) => {
        const comp = place.address_components.find((c) => c.types.includes(type));
        return comp ? comp.long_name : "";
      };

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");

      setFormData((prev) => ({
        ...prev,
        address1: `${streetNumber} ${route}`.trim(),
        suburb: getComponent("sublocality") || getComponent("locality"),
        town: getComponent("administrative_area_level_1"),
        postalCode: getComponent("postal_code"),
      }));
    });

    setPredictions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const addressRef = doc(db, "users", user.uid, "addresses", id);
      await updateDoc(addressRef, formData);
      alert("Address updated!");
      navigate("/address-book");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h1 className="text-4xl font-bold mb-6">EDIT ADDRESS</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Address Title" name="addressTitle" value={formData.addressTitle} onChange={handleChange} required />
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Address line 1 *</label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleAddressChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
            required
          />
          {predictions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 shadow-md max-h-60 overflow-y-auto animate-slide-in">
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectPrediction(pred.description, pred.place_id)}
                >
                  {pred.description}
                </div>
              ))}
              <div
                className="px-4 py-2 text-blue-600 hover:underline cursor-pointer text-sm"
                onClick={() => setPredictions([])}
              >
                Type manual address
              </div>
            </div>
          )}
        </div>

        <Input label="Address line 2" name="address2" value={formData.address2} onChange={handleChange} />
        <Input label="Suburb" name="suburb" value={formData.suburb} onChange={handleChange} required />

        <div>
          <label className="block text-sm font-medium mb-1">Town *</label>
          <select
            name="town"
            value={formData.town}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="Australian Capital Territory">Australian Capital Territory</option>
            <option value="New South Wales">New South Wales</option>
            <option value="Northern Territory">Northern Territory</option>
            <option value="Queensland">Queensland</option>
            <option value="South Australia">South Australia</option>
            <option value="Tasmania">Tasmania</option>
            <option value="Victoria">Victoria</option>
            <option value="Western Australia">Western Australia</option>
          </select>
        </div>

        <Input label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />

        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <input
            type="text"
            name="country"
            value="Australia"
            disabled
            className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button type="button" onClick={() => navigate("/address-book")} className="border px-6 py-2">
            CANCEL
          </button>
          <button type="submit" className="bg-black text-white px-6 py-2 font-semibold">
            SAVE
          </button>
        </div>

        <p onClick={() => navigate("/account")} className="mt-6 text-sm underline cursor-pointer">
          ← Back to Account
        </p>
      </form>
    </div>
  );
};

const Input = ({ label, name, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label} {props.required && "*"}
    </label>
    <input
      type={type}
      name={name}
      {...props}
      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
    />
  </div>
);

export default EditAddress;
