import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router, Route, and Routes
import Login from './components/Auth/Login';
import React, { useState, useEffect } from 'react';
import Register from './components/Auth/Register'; // Import the Register component
import Dashboard from './components/Dashboard/Dashboard';
import BottlesTable from './components/Dashboard/Bottles/BottlesTable';
import RecordOrder from './components/Dashboard/Bottles/RecordOrder';
import Days from './components/Dashboard/OtherTables/Days';
import AreasForDay from './components/Dashboard/OtherTables/AreasForDay';
import CustomersForArea from './components/Dashboard/OtherTables/CustomersForArea';
import Areas from './components/Dashboard/OtherTables/Areas';
import Addresses from './components/Dashboard/OtherTables/Addresses';
import Customers from './components/Dashboard/OtherTables/Customers';
import AddArea from './components/Dashboard/Areas/AddArea';
function AdminRouter() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   useEffect(() => {
//     // Check if the user is authenticated here, e.g., by inspecting the authentication header
//     const token = localStorage.getItem('token'); // You should replace this with your authentication method
//     if (token) {
//       setIsLoggedIn(true);
//     }
//   }, [isLoggedIn]);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Login />} />
          <Route path="/viewOrders" element={isLoggedIn ? <BottlesTable /> : <Login />} />
          <Route path="/recordOrder" element={isLoggedIn ? <RecordOrder /> : <Login />} />
          <Route path="/days" element={isLoggedIn ? <Days /> : <Login />} />
          <Route path="/areas" element={isLoggedIn ? <Areas /> : <Login />} />
          <Route path="/customers" element={isLoggedIn ? <Customers /> : <Login />} />
          <Route path="/addresses/:areaId" element={isLoggedIn ? <Addresses /> : <Login />} />
          <Route path="/areas/:dayId" element={isLoggedIn ? <AreasForDay /> : <Login />} />
          <Route path="/customers/:areaId" element={isLoggedIn ? <CustomersForArea /> : <Login />} />
          <Route path="/areas/add" element={isLoggedIn ? <AddArea /> : <Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default AdminRouter;