import React from "react";
import { CircleX, LucideIcon } from "lucide-react";

interface StatCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  statCards: {
    id: string;
    title: string;
    icon: LucideIcon;
    visible: boolean;
  }[];
  toggleVisibility: (id: string) => void;
}

export const StatCardModal: React.FC<StatCardModalProps> = ({
  isOpen,
  onClose,
  statCards,
  toggleVisibility,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between itmes-center mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Customize Stat Cards
          </h2>
          <div>
            <button onClick={onClose} className="text-red-500 border-gray-700">
              <CircleX className="h-6 w-6 text-indigo-300 size-32" />
            </button>
          </div>
        </div>
        <ul>
          {statCards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between mb-2"
            >
              <div className="flex items-center">
                <card.icon className="h-6 w-6 text-indigo-400 mr-2" />
                <span className="text-white">{card.title}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={card.visible}
                  onChange={() => toggleVisibility(card.id)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-blue-600 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </li>
          ))}
        </ul>
        {/* <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md">
          Close
        </button> */}
      </div>
    </div>
  );
};
