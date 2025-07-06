import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FacturesPage from "./pages/FacturesPages";
import BLPage from "./pages/BLpage";
import NotFound from "./pages/NotFound";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/factures" element={<FacturesPage />} />
        <Route path="/bl" element={<BLPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}