import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Osp from "./pages/Osp";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify" element={<Osp />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
