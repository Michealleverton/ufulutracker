import { ToolbarProps } from "react-big-calendar";

const CustomToolbar = (toolbar: ToolbarProps) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToToday = () => {
    toolbar.onNavigate("TODAY");
  };

  const formatLabel = () => {
    const date = new Date(toolbar.date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const isActiveView = (view: string) => toolbar.view === view;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Trading Calendar
        </h2>
        <p className="text-gray-400 text-lg font-medium mt-1">
          {formatLabel()}
        </p>
      </div>

      {/* Navigation and View Controls */}
      <div className="flex items-center justify-between">
        {/* Left Side - Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={goToBack}
            className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors"
            title="Previous"
          >
            <svg 
              className="w-5 h-5 text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Today
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={goToNext}
            className="flex items-center justify-center w-10 h-10 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors"
            title="Next"
          >
            <svg 
              className="w-5 h-5 text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Right Side - View Toggle Buttons */}
        <div className="flex bg-gray-700 rounded-lg p-1 border border-gray-600">
          <button
            type="button"
            onClick={() => toolbar.onView("month")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isActiveView("month")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => toolbar.onView("week")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isActiveView("week")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => toolbar.onView("day")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isActiveView("day")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            Day
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomToolbar;
