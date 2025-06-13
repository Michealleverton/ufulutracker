import React, { useState, useEffect } from 'react';
import type { Trade } from '../types';

interface EditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onSave: (updatedTrade: Trade) => void;
}

export const EditTradeModal: React.FC<EditTradeModalProps> = ({ isOpen, onClose, trade, onSave }) => {
  const [updatedTrade, setUpdatedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    if (trade) {
      setUpdatedTrade(trade);
    }
  }, [trade]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (updatedTrade) {
      setUpdatedTrade({ ...updatedTrade, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updatedTrade) {
      onSave(updatedTrade);
      onClose();
    }
  };

  if (!isOpen || !updatedTrade) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-md w-1/3">
        <h2 className="text-xl mb-4">Edit Trade</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={updatedTrade.date}
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
              value={updatedTrade.symbol}
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
              value={updatedTrade.type}
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
              value={updatedTrade.quantity}
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
              value={updatedTrade.price}
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
              value={updatedTrade.profit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Notes</label>
            <input
              type="text"
              name="notes"
              value={updatedTrade.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
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