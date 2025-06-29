import React, { useEffect, useState } from "react";
import { auth } from "../../utils/firebaseConfig";
import { addSize, getSizes } from "../../services/sizesService";
import toast from "react-hot-toast";

const sizeOptions = Array.from({ length: 21 }, (_, i) => String(44 + i)); // 44–64

// Perfectly aligned positions (based on actual outline images)
const leftHandCoords = {
  pinky: { cx: 41, cy: 112 },
  ring: { cx: 63, cy: 97 },
  middle: { cx: 93, cy: 90 },
  index: { cx: 123, cy: 97 },
  thumb: { cx: 151, cy: 140 },
  wrist: { cx: 90, cy: 221 },
};

const rightHandCoords = {
  pinky: { cx: 160, cy: 112 },
  ring: { cx: 137, cy: 97 },
  middle: { cx: 107, cy: 91 },
  index: { cx: 77, cy: 97 },
  thumb: { cx: 49, cy: 141 },
  wrist: { cx: 110, cy: 221 },
};

const Sizes = () => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    if (auth.currentUser) fetchSizes();
  }, []);

  const fetchSizes = async () => {
    const list = await getSizes(auth.currentUser.uid);
    setSizes(list);
  };

  const handlePartClick = (hand, part) => {
    setSelectedPart({ hand, part });
    const found = sizes.find((s) => s.hand === hand && s.part === part);
    setSelectedValue(found ? found.value : "");
  };

  const handleSave = async () => {
    if (!selectedValue || !selectedPart) return;
    await addSize(auth.currentUser.uid, {
      ...selectedPart,
      value: selectedValue,
    });
    toast.success("Size saved!");
    setSelectedPart(null);
    setSelectedValue("");
    fetchSizes();
  };

  const getLabel = (hand, part) => {
    const found = sizes.find((s) => s.hand === hand && s.part === part);
    return found?.value || "";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-2">Save your jewellery sizes</h2>
      <p className="text-sm text-gray-600 mb-6">
        Click a finger or wrist on the hand diagram to set your size.
      </p>

      <div className="flex justify-center gap-12 mb-6">
        {/* Left Hand */}
        <div className="relative w-[200px] h-[300px]">
          <img
            src="/left-hand-outline.png"
            alt="Left Hand"
            className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
          />
          <svg
            width="200"
            height="300"
            viewBox="0 0 200 300"
            className="absolute top-0 left-0"
          >
            {Object.entries(leftHandCoords).map(([part, { cx, cy }]) => (
              <circle
                key={part}
                cx={cx}
                cy={cy}
                r="12"
                fill="white"
                stroke="black"
                onClick={() => handlePartClick("left", part)}
                style={{ cursor: "pointer" }}
              />
            ))}
            {Object.entries(leftHandCoords).map(([part, { cx, cy }]) => {
              const val = getLabel("left", part);
              return val ? (
                <text
                  key={part}
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fontSize="8"
                  fill="black"
                >
                  {val}
                </text>
              ) : null;
            })}
          </svg>
        </div>

        {/* Right Hand */}
        <div className="relative w-[200px] h-[300px]">
          <img
            src="/right-hand-outline.png"
            alt="Right Hand"
            className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
          />
          <svg
            width="200"
            height="300"
            viewBox="0 0 200 300"
            className="absolute top-0 left-0"
          >
            {Object.entries(rightHandCoords).map(([part, { cx, cy }]) => (
              <circle
                key={part}
                cx={cx}
                cy={cy}
                r="12"
                fill="white"
                stroke="black"
                onClick={() => handlePartClick("right", part)}
                style={{ cursor: "pointer" }}
              />
            ))}
            {Object.entries(rightHandCoords).map(([part, { cx, cy }]) => {
              const val = getLabel("right", part);
              return val ? (
                <text
                  key={part}
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fontSize="8"
                  fill="black"
                >
                  {val}
                </text>
              ) : null;
            })}
          </svg>
        </div>
      </div>

      {/* Size Picker */}
      {selectedPart && (
        <>
          <p className="mb-2 font-semibold">
            Select size for {selectedPart.hand} {selectedPart.part}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedValue(size)}
                className={`border px-3 py-1 rounded ${
                  selectedValue === size
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default Sizes;
