import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "../lib/supabase";
import CustomToolbar from "./CustomToolbar"; // Import the custom toolbar
import "../css/JournalCalendar.css"; // Import the CSS file
import "../css/Loader.css";

const localizer = momentLocalizer(moment);

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  profit: number; // Use the profit field
}

const JournalCalendar: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("id, date, profit");
    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      const formattedData = data.map((trade: any) => ({
        id: trade.id,
        date: moment(trade.date).toISOString(), // Parse the date using moment and convert to ISO string
        title: `${trade.profit}`,
        content: "",
        profit: trade.profit,
      }));
      console.log(data);
      setEntries(formattedData);
      setIsLoading(false);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    const title = prompt("Enter a title for your journal entry:");
    if (title) {
      const newEntry = {
        id: crypto.randomUUID(),
        date: start.toISOString(),
        title,
        content: "",
        profit: 0, // Default profit
      };
      saveEntry(newEntry);
    }
  };

  const handleSelectEvent = (event: JournalEntry) => {
    const action = prompt(
      'Enter "update" to update the entry or "delete" to delete the entry:',
      "update"
    );
    if (action === "update") {
      const content = prompt("Update your journal entry:", event.content);
      if (content !== null) {
        const updatedEntry = { ...event, content };
        updateEntry(updatedEntry);
      }
    } else if (action === "delete") {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this entry?"
      );
      if (confirmDelete) {
        deleteEntry(event);
      }
    }
  };

  const saveEntry = async (entry: JournalEntry) => {
    const { error } = await supabase.from("journal_entries").insert([entry]);
    if (error) {
      console.error("Error saving entry:", error);
    } else {
      setEntries([...entries, entry]);
    }
  };

  const updateEntry = async (entry: JournalEntry) => {
    const { error } = await supabase
      .from("journal_entries")
      .update(entry)
      .eq("id", entry.id);
    if (error) {
      console.error("Error updating entry:", error);
    } else {
      setEntries(entries.map((e) => (e.id === entry.id ? entry : e)));
    }
  };

  const deleteEntry = async (entry: JournalEntry) => {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entry.id);
    if (error) {
      console.error("Error deleting entry:", error);
    } else {
      setEntries(entries.filter((e) => e.id !== entry.id));
    }
  };

  const eventStyleGetter = (event: any) => {
    const borderColor = event.resource.profit > 0 ? "green" : "red";
    const style = {
      border: `2px solid ${borderColor}`,
      backgroundColor: "transparent",
      color: "black",
      borderRadius: "3px",
      padding: "2px",
      paddingLeft: "5px",
      fontSize: "0.9em",
    };
    return {
      style,
    };
  };

  const dayPropGetter = (date: Date) => {
    // Filter all trades for the given day
    const dayTrades = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
  
    // Calculate the total profit/loss for the day
    const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
  
    // Determine the background color based on the total profit/loss
    let style = {};
    if (dayTrades.length > 0) {
      style = {
        backgroundColor: totalProfit > 0 ? "#90EE90" : "#FFB6C1", // Green for profit, red for loss
        color: "white",
        border: "1px solid black",
      };
    }
  
    return {
      style,
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className='loader'>
          <div className="loader-item"></div>
          <div className="loader-item"></div>
          <div className="loader-item"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10">

      <Calendar
        localizer={localizer}
        events={entries.map((entry) => ({
          title: entry.title,
          start: new Date(entry.date),
          end: new Date(entry.date),
          allDay: true,
          resource: entry,
        }))}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => handleSelectEvent(event.resource)}
        style={{ height: 700, color: "white", padding: 20, borderRadius: 10 }}
        components={{
          toolbar: CustomToolbar, // Use the custom toolbar
        }}
        eventPropGetter={eventStyleGetter} // Apply custom event styles
        dayPropGetter={dayPropGetter} // Apply custom day styles
        popup={true} // Enable popup for multiple events
        showMultiDayTimes={true} // Ensure multi-day events are shown correctly
      />
      
    </div>
  );
};

export default JournalCalendar;