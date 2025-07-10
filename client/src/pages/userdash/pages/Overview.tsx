import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../lib/supabase';

const Overview = () => {
  const [tradeData, setTradeData] = useState<{ date: string; price: number }[]>([]);

  useEffect(() => {
    const fetchTradeData = async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('date, profit');

      if (error) {
        console.error('Error fetching trade data:', error);
      } else {
        // Format the data for the chart
        const formattedData = data.map(trade => ({
          date: new Date(trade.date).toLocaleDateString(),
          price: trade.profit,
        }));
        setTradeData(formattedData);
        console.log(data);
      }
    };

    fetchTradeData();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-gray-800 p-4 rounded-md">
        <h2 className="text-center text-lg font-semibold text-white mb-2">Equity Curve</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={tradeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#000', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Add your overview content here */}
    </div>
  );
};

export default Overview;