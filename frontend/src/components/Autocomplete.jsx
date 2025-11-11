// src/components/AutocompleteInput.jsx
import { useState, useEffect, useRef } from "react";

export default function AutocompleteInput({ value, onChange, placeholder = "Enter location (Chandigarh)" }) {
  const [q, setQ] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`;
        const resp = await fetch(url);
        const data = await resp.json();

        // Filter for Chandigarh region
        const filtered = data.features.filter((f) => {
          const p = f.properties || {};
          const txt = `${p.name} ${p.city} ${p.state}`.toLowerCase();
          return txt.includes("chandigarh");
        });

        setSuggestions(filtered.length ? filtered : data.features);
      } catch (err) {
        console.error("Photon fetch error:", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div className="relative">
      <input
        className="border rounded w-full p-2"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded mt-1 max-h-48 overflow-y-auto z-50">
          {suggestions.map((s, i) => {
            const p = s.properties;
            const label = `${p.name || ""}${p.city ? `, ${p.city}` : ""}${p.state ? `, ${p.state}` : ""}`;
            return (
              <li
                key={i}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setQ(label);
                  setSuggestions([]);
                  onChange(label);
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
