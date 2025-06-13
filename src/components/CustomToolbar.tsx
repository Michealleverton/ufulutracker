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

  const label = () => {
    const date = new Date(toolbar.date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const buttonStyle = {
    backgroundColor: "#1f2937",
    color: "#9ca3af",
    border: "red",
    padding: "10px",
    borderRadius: "5px",
    margin: "0 5px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    ":hover": {
      backgroundColor: "blue",
      color: "white",
    },
  };

  return (
    <div
      className="rbc-toolbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <div className="rbc-btn-group">
        <button type="button" onClick={goToBack} style={buttonHoverStyle}>
          Back
        </button>
        <button type="button" onClick={goToToday} style={buttonStyle}>
          Current
        </button>
        <button type="button" onClick={goToNext} style={buttonStyle}>
          Next
        </button>
      </div>
      <span
        className="rbc-toolbar-label"
        style={{ fontSize: "20px", fontWeight: "bold" }}
      >
        <span className="text-3xl capitalize">Trading Calendar</span>
        <br />
        {label()}
      </span>
      <div className="rbc-btn-group">
        <button
          type="button"
          onClick={() => toolbar.onView("month")}
          style={buttonStyle}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => toolbar.onView("week")}
          style={buttonStyle}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => toolbar.onView("day")}
          style={buttonStyle}
        >
          Day
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar;
