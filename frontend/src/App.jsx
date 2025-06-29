import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import VerifyEmail from './pages/public/VerifyEmail.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
