import React, { useEffect, useState } from "react";
import logo from "../assets/logo-osplus.png";
import { listWorkspaces } from "../lib/workspace";
import Sidebar from "./Sidebar";
import PrincipalPage from "./PrincipalPage";

export default function PageRecherche({ onNewWorkspace, onShowSearch, showSearch, onSelectWorkspace, onDelete }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ état recherche
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    async function fetchWorkspaces() {
      const data = await listWorkspaces();
      setWorkspaces(data);
    }
    fetchWorkspaces();
  }, []);

  // ✅ Filtrage selon le terme saisi
  const filteredWorkspaces = workspaces.filter((ws) =>
    (ws.name || ws.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ✅ Si aucun workspace
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex">
        <Sidebar
          logo={logo}
          onNewWorkspace={onNewWorkspace}
          onShowSearch={onShowSearch}
          showSearch={showSearch}
        />
        <PrincipalPage />
      </div>
    );
  }

  return (

    <div className="flex">
      <Sidebar
        logo={logo}
        onNewWorkspace={onNewWorkspace}
        onShowSearch={onShowSearch}
        showSearch={showSearch}
      />

      {/* Contenu principal scrollable */}
      <div className="ml-24 flex-1 min-h-screen p-12 flex flex-col items-center overflow-y-auto">
        <h2 className="w-full text-5xl text-white mb-6 font-bold text-center">
          Liste des dossiers
        </h2>

        {/* ✅ Champ recherche */}
        <input
          type="text"
          placeholder="Rechercher un dossier"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 w-full p-2 rounded-lg border border-gray-300 text-black text-lg"
        />

        <ul className="text-white/80 w-full">
          {filteredWorkspaces.length > 0 ? (
            filteredWorkspaces.map((workspace) => (
              <li
                key={workspace.id}
                className="flex items-center justify-between gap-2 w-full mb-4"
              >
                <button
                  className="bg-transparent border-none p-0 text-white cursor-pointer flex-1 text-xl font-extrabold tracking-wide text-left hover:underline"
                  onClick={() => onSelectWorkspace(workspace.id)}
                  style={{ fontFamily: "Avenir, Helvetica, Arial, sans-serif" }}
                >
                  {workspace.name || workspace.title}
                </button>
                <span
                  className="flex-1 text-right text-l font-bold text-gray-200"
                  style={{ fontFamily: "Avenir, Helvetica, Arial, sans-serif" }}
                >
                  {new Date(workspace.created_at).toLocaleDateString()}
                </span>
                {confirmDeleteId !== workspace.id ? (
                <button
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Supprimer"
                  onClick={() => setConfirmDeleteId(workspace.id)}
                >
                  🗑️
                </button>
                ) : (
                <div className="ml-4 flex gap-2 items-center">  
                  <span className="text-sm text-white/80">
                    Confirmer ? (attention, cette action est irréversible)
                  </span>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    onClick={async () => {
                    await onDelete(workspace.id);
                    await setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspace.id));
                  }}
                  >
                    Oui
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Non
                  </button>
                  
                </div>
              )
            }
              </li>
            ))
          ) : (
            <li className="text-white/60 text-center">
              Aucun dossier trouvé.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
