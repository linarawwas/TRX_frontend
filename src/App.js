import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router, Route, and Routes
import Login from './components/Auth/Login';
import Register from './components/Auth/Register'; // Import the Register component
import Dashboard from './components/Dashboard/Dashboard';
import BottlesTable from './components/Dashboard/Bottles/BottlesTable';
import RecordOrder from './components/Dashboard/Bottles/RecordOrder';
import Days from './components/Dashboard/Days/Days';
import AreasForDay from './components/Dashboard/Days/AreasForDay';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewOrders" element={<BottlesTable />} />
          <Route path="/recordOrder" element={<RecordOrder />} />
          <Route path="/days" element={<Days />} />
          <Route path="/areas/:dayId" element={<AreasForDay/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
