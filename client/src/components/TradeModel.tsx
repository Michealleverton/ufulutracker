import React, { useState } from 'react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: any) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [trade, setTrade] = useState({
    date: '',
    symbol: '',
    type: '',
    quantity: '',
    price: '',
    profit: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrade((prevTrade) => ({ ...prevTrade, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(trade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-md w-1/3">
        <h2 className="text-xl mb-4">Add Trade</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={trade.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={trade.symbol}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Type</label>
            <input
              type="text"
              name="type"
              value={trade.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={trade.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={trade.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Profit</label>
            <input
              type="number"
              name="profit"
              value={trade.profit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Notes</label>
            <input
              type="text"
              name="notes"
              value={trade.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-4 px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};