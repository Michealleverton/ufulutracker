import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase"; // Adjust the import path as needed

interface Strategy {
  id: number;
  name: string;
}

const Strategydropdown: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<"basic" | "pro" | "premium">("basic");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user plan (replace with actual API call or logic)
        const userPlan = "pro"; // Example: fetched user plan
        setUserPlan(userPlan as "basic" | "pro" | "premium");

        // Fetch strategies from the database
        const { data: strategies, error } = await supabase
          .from("trades") // Replace "trades" with your actual table name
          .select("id, strategy"); // Adjust the column names as needed

        if (error) {
          console.error("Error fetching strategies:", error);
          return;
        }

        // Map the fetched strategies to the expected format
        const formattedStrategies = strategies.map((trade: { id: number; strategy: string }) => ({
          id: trade.id,
          name: trade.strategy,
        }));

        setStrategies(formattedStrategies);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleAddStrategy = () => {
    // Simulate adding a new strategy
    const newStrategy = { id: strategies.length + 1, name: `Strategy ${strategies.length + 1}` };
    setStrategies((prevStrategies) => [...prevStrategies, newStrategy]);
  };

  return (
    <div className="relative ml-6 z-10" ref={dropdownRef}>
      {/* Dropdown Button */}
      {userPlan !== "basic" && (
        <button
          className="bg-gray-800 text-gray-400 px-4 py-2 rounded-md border-[1.75px] border-indigo-300"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Strategy
        </button>
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && userPlan !== "basic" && (
        <div
          id="dropdown-menu"
          className="absolute left-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg"
        >
          {strategies.map((strategy) => (
            <a
              key={strategy.id}
              href="#"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              {strategy.name}
            </a>
          ))}

          {/* Add Strategy Button */}
          {userPlan === "premium" && (
            <button
              onClick={handleAddStrategy}
              className="w-full text-left block px-4 py-2 hover:bg-gray-700"
            >
              Add Strategy
            </button>
          )}
          {userPlan === "pro" && strategies.length < 3 && (
            <button
              onClick={handleAddStrategy}
              className="w-full text-left block px-4 py-2 hover:bg-gray-700"
            >
              Add Strategy
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Strategydropdown;