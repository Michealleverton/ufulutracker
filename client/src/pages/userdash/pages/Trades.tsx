import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { Trade } from "../../../types/index";
import { useStrategyContext } from "../../../Context/StrategyContext";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import "../../../css/Loader.css";
import toast from "react-hot-toast";

{
  /* data grid imports */
}
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import type { GridAlignment } from "@mui/x-data-grid";

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );

  const { activeStrategy, user } = useStrategyContext();

  useEffect(() => {
    if (activeStrategy && user) {
      fetchTrades();
    }
  }, [activeStrategy, user]);

  const fetchTrades = async () => {
    if (!activeStrategy || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .eq("strategy_id", activeStrategy.id)
        .order("date", { ascending: false }); // Sort by date in descending order
      
      if (error) {
        console.error("Error fetching trades:", error);
        setError("Loading Error");
        toast.error("Failed to load trades");
      } else {
        setTrades(data || []);
      }
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError("Loading Error");
      toast.error("Failed to load trades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrade = async () => {
    if (!activeStrategy || !user) {
      toast.error("No active strategy selected");
      return;
    }

    console.log("Create button clicked"); // Debugging log
    const newTrade: Trade = {
      id: uuidv4(), // Use uuidv4 to generate a unique ID
      user_id: user.id,
      strategy_id: activeStrategy.id,
      date: new Date().toLocaleDateString("en-CA"), // Set date to local time zone in YYYY-MM-DD format
      symbol: "",
      type: "buy",
      price: 0,
      quantity: 0,
      profit: 0,
      notes: "",
    };
    
    console.log("New trade:", newTrade); // Debugging log
    
    try {
      const { data, error } = await supabase.from("trades").insert([newTrade]);
      if (error) {
        console.error("Error creating trade:", error); // Log the error object
        toast.error("Failed to create trade");
      } else {
        console.log("Trade created:", data);
        toast.success("Trade created successfully");
        fetchTrades();
      }
    } catch (err) {
      console.error("Error creating trade:", err);
      toast.error("Failed to create trade");
    }
  };

  const handleUpdateTrade = async (updatedTrade: Trade) => {
    if (!activeStrategy || !user) {
      toast.error("No active strategy selected");
      return;
    }

    console.log("Updating trade:", updatedTrade);
    
    try {
      const { data, error } = await supabase
        .from("trades")
        .update({
          ...updatedTrade,
          user_id: user.id, // Ensure user_id is set
          strategy_id: activeStrategy.id, // Ensure strategy_id is set
        })
        .eq("id", updatedTrade.id)
        .eq("user_id", user.id); // Security: only update user's own trades
      
      if (error) {
        console.error("Error updating trade:", error);
        toast.error("Failed to update trade");
      } else {
        console.log("Trade updated:", data);
        toast.success("Trade updated successfully");
        fetchTrades();
      }
    } catch (err) {
      console.error("Error updating trade:", err);
      toast.error("Failed to update trade");
    }
  };

  const handleDeleteSelectedTrades = async () => {
    if (!user) {
      toast.error("No user authenticated");
      return;
    }

    if (selectionModel.length === 0) {
      toast.error("No trades selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .in("id", selectionModel)
        .eq("user_id", user.id); // Security: only delete user's own trades
      
      if (error) {
        console.error("Error deleting selected trades:", error);
        toast.error("Failed to delete trades");
      } else {
        console.log("Selected trades deleted");
        toast.success(`${selectionModel.length} trade(s) deleted successfully`);
        setSelectionModel([]); // Clear selection
        fetchTrades();
      }
    } catch (err) {
      console.error("Error deleting selected trades:", err);
      toast.error("Failed to delete trades");
    }
  };

  const processRowUpdate = async (newRow: Trade) => {
    await handleUpdateTrade(newRow);
    return newRow;
  };

  const columns = [
    // {
    //   field: "id",
    //   headerName: "ID",
    //   headerClassName: "super-app-theme--header",
    //   cellClassName: "name-column--cell",
    // },
    {
      field: "date",
      headerName: "Date",
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "symbol",
      headerName: "Symbol",
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
    {
      field: "type",
      headerName: "Type",
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      type: "singleSelect" as const,
      valueOptions: ["buy", "sell"],
      editable: true,
    },
    {
      field: "price",
      headerAlign: "left" as GridAlignment,
      align: "left" as GridAlignment,
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      headerAlign: "left" as GridAlignment,
      align: "left" as GridAlignment,
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
    {
      field: "profit",
      headerName: "Profits",
      headerAlign: "left" as GridAlignment,
      align: "left" as GridAlignment,
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
    {
      field: "notes",
      headerName: "Notes",
      headerClassName: "super-app-theme--header",
      cellClassName: "name-column--cell",
      flex: 1,
      editable: true,
    },
  ];

  // Show loading or no strategy message
  if (!user || !activeStrategy) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {!user ? "Please log in to view trades" : "No active strategy selected"}
          </h2>
          <p className="text-gray-400">
            {!user 
              ? "You need to be logged in to access your trades."
              : "Please select an active strategy from the sidebar to view and manage your trades."
            }
          </p>
        </div>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <div className="text-center text-white weight-bold text-3xl m-6 mt-8">
          Tradesheet - {activeStrategy.name}
        </div>
        <div className="text-center text-white weight-bold text-lg mb-8">
          <h1>
            Here you enter in your trades and this will update all the analytics
            and any charts in this app.
            <br />
            You can filter and manage columns, create, update and delete rows.
          </h1>
        </div>

        <Box
          className="ml-32 mr-32"
          sx={{
            "& .super-app-theme--header": {
              backgroundColor: "#3b82f6",
              color: "black",
              fontWeight: 900,
              margin: "0",
            },
            "& .name-column--cell": {
              color: "white",
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            },
            "& .MuiPaginationItem-colorPrimary": {
              color: "white",
              border: "none",
            },
            "& .MuiPaginationItem-root": {
              color: "white",
            },
            "& .MuiDataGrid-root": {
              borderLeft: "1px solid white",
              borderRight: "1px solid white",
              borderTop: "none",
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#3b82f6",
              fontWeight: 900,
            },
            "& .MuiDataGrid-cell:hover": {
              color: "#3b82f6",
            },
            "& .MuiCheckbox-root": {
              color: "white",
            },
            "& .MuiCheckbox-root.Mui-checked": {
              color: "white",
            },
            "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
              {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#3b82f6",
              },
            "& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root": {
              color: "white",
            },
            "& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root.Mui-checked":
              {
                color: "white",
              },
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-auto">
              <div className="loader absolute top-1/2 left-1/2">
                <div className="loader-item"></div>
                <div className="loader-item"></div>
                <div className="loader-item"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-4">Loading Error</div>
          ) : trades.length === 0 ? (
            <div className="text-center text-white mt-8">
              <h3 className="text-xl mb-4">No trades yet for {activeStrategy.name}</h3>
              <p className="text-gray-400 mb-6">Create your first trade to get started!</p>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "#1e40af",
                  },
                  padding: "12px 24px",
                  fontSize: "16px"
                }}
                onClick={handleCreateTrade}
              >
                Create Your First Trade
              </Button>
            </div>
          ) : (
            <>
              <Box display="flex" className="gap-4" marginBottom="10px">
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1e40af",
                    },
                  }}
                  onClick={handleCreateTrade}
                >
                  Create
                </Button>
                <button
                  onClick={() => (window.location.href = "/api/broker/connect")}
                  className="bg-[#3b82f6] hover:bg-[#1e40af] text-white px-4 py-2 rounded !important"
                >
                  Connect Broker
                </button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1e40af",
                    },
                    // Add style for disabled state
                    "&.Mui-disabled": {
                      backgroundColor: "#111827", // Use a dark gray color, similar to bg-gray-800
                      color: "rgba(255, 255, 255, 0)", // Optional: adjust text color for disabled state
                    },
                  }}
                  onClick={handleDeleteSelectedTrades}
                  disabled={selectionModel.length === 0} // Ensure button is disabled when no rows are selected
                >
                  Delete Selected
                </Button>
              </Box>
              <Box sx={{ height: 476, width: "100%", marginBottom: "40px" }}>
                {" "}
                {/* Set a fixed height for the DataGrid container */}
                <DataGrid
                  rows={trades}
                  columns={columns}
                  editMode="row"
                  checkboxSelection // Enable checkbox selection
                  onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                  }}
                  processRowUpdate={processRowUpdate} // Handle row updates
                  pageSizeOptions={[
                    7,
                    10,
                    20,
                    50,
                    100,
                    { value: 1000, label: "1,000" },
                    { value: -1, label: "All" },
                  ]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 7, page: 0 },
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Trades;
