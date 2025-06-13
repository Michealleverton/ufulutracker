import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { Trade } from "../../../types/index";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import "../../../css/Loader.css";

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

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("date", { ascending: false }); // Sort by date in descending order
    if (error) {
      console.error("Error fetching trades:", error);
      setError("Loading Error");
    } else {
      setTrades(data);
    }
    setIsLoading(false);
  };

  const handleCreateTrade = async () => {
    console.log("Create button clicked"); // Debugging log
    const newTrade: Trade = {
      id: uuidv4(), // Use uuidv4 to generate a unique ID
      date: new Date().toLocaleDateString("en-CA"), // Set date to local time zone in YYYY-MM-DD format
      symbol: "",
      type: "buy",
      price: 0,
      quantity: 0,
      profit: 0,
      notes: "",
    };
    console.log("New trade:", newTrade); // Debugging log
    const { data, error } = await supabase.from("trades").insert([newTrade]);
    if (error) {
      console.error("Error creating trade:", error); // Log the error object
    } else {
      console.log("Trade created:", data);
      fetchTrades();
    }
  };

  const handleUpdateTrade = async (updatedTrade: Trade) => {
    console.log("Updating trade:", updatedTrade);
    const { data, error } = await supabase
      .from("trades")
      .update(updatedTrade)
      .eq("id", updatedTrade.id);
    if (error) {
      console.error("Error updating trade:", error);
    } else {
      console.log("Trade updated:", data);
      fetchTrades();
    }
  };

  const handleDeleteSelectedTrades = async () => {
    const { error } = await supabase
      .from("trades")
      .delete()
      .in("id", selectionModel);
    if (error) {
      console.error("Error deleting selected trades:", error);
    } else {
      console.log("Selected trades deleted");
      fetchTrades();
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

  return (
    <>
      <Box>
        <div className="text-center text-white weight-bold text-3xl m-6 mt-8">
          Tradesheet
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
              border: "none",
            },
            "& .MuiPaginationItem-colorPrimary": {
              color: "white",
              border: "none",
            },
            "& .MuiPaginationItem-root": {
              color: "white",
            },
            "& .MuiDataGrid-root": {
              border: "none",
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
            <div className="text-center text-white mt-4">No Rows</div>
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
                  }}
                  onClick={handleDeleteSelectedTrades}
                  disabled={selectionModel.length === 0} // Ensure button is disabled when no rows are selected
                >
                  Delete Selected
                </Button>
              </Box>
              <Box sx={{ height: 476, width: "100%" }}>
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
