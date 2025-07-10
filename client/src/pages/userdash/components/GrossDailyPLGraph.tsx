import React, { useState } from "react";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrossDailyPLGraphProps {
  data: { date: string; profit: number }[];
}

const GrossDailyPLGraph: React.FC<GrossDailyPLGraphProps> = ({ data }) => {
  const [days, setDays] = useState(30); // Default to 30 days

  // Helper function to map dates to days of the week
  const getDayOfWeek = (dateString: string) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  };

  // Transform data to include days of the week
  const transformedData = data.map((item) => ({
    ...item,
    dayOfWeek: getDayOfWeek(item.date), // Add a new field for the day of the week
  }));

  // Filter data based on the selected time range
  const filteredData = transformedData.slice(-days);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-white mb-4">Gross Daily P&L</h2>

      {/* Buttons to switch time range */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setDays(30)}
          className={`px-4 text-sm py-2 mx-2 rounded ${days === 30 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
        >
          30 Days
        </button>
        <button
          onClick={() => setDays(60)}
          className={`px-4 py-2 mx-2 rounded ${days === 60 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
        >
          60 Days
        </button>
        <button
          onClick={() => setDays(90)}
          className={`px-4 py-2 mx-2 rounded ${days === 90 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
        >
          90 Days
        </button>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredData} width={500} height={300}>
        <CartesianGrid  />
          <XAxis dataKey="dayOfWeek" tick={{ fill: "#fff" }} padding={{ left: 10, right: 10 }} />
          {/* <YAxis  /> */}
          <Tooltip
            contentStyle={{ backgroundColor: "#333", borderRadius: "8px", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number) => `$${value.toFixed(2)}`} // Format profit to 2 decimal places
          />
          <Bar dataKey="profit" fill="#8884d8" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrossDailyPLGraph;