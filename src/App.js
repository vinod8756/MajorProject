import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Homepage from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Signup from "./Components/Login/SignUp";
import ProtectedRoute from "./protectedRoute";
import { Box } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Box
              sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Login />
            </Box>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home/*"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/home/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
