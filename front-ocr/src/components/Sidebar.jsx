import React from "react";

const Sidebar = ({ documents, onEdit, onSelect }) => (
  <aside className="sidebar">
    <button onClick={onEdit} className="icon-btn">✏️</button>
    <p className="text-xs text-gray-500 mb-2">Nouveau</p>
    <button onClick={onSelect} className="icon-btn">🧐</button>
    <p className="text-xs text-gray-500 mb-2">Rechercher</p>
  </aside>
);

export default Sidebar;