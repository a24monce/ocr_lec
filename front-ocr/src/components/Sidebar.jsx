import React from "react";

const Sidebar = ({ logo, onNewWorkspace, onShowSearch, showSearch }) => (
  <aside className="fixed top-0 left-0 h-screen w-24 bg-[#e5e0f7] flex flex-col items-center py-6">
    <img src={logo} alt="Logo OS+" className="w-16 mb-6" />

    <button
      onClick={onNewWorkspace}
      className="w-12 h-12 bg-[#a18aff] text-white rounded-full mb-2 flex items-center justify-center"
    >
      ➕
    </button>
    <p className="text-xs text-gray-500 mb-4">Nouveau</p>

    <button
      onClick={onShowSearch}
      className={`w-12 h-12 rounded-full flex items-center justify-center ${
        showSearch ? "bg-[#a18aff] text-white" : "bg-gray-200 text-black"
      }`}
    >
      🔍
    </button>
    <p className="text-xs text-gray-500">Rechercher</p>
  </aside>
);

export default Sidebar;

