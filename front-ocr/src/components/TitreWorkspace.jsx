import React, { useState } from "react";
import { updateWorkspace } from "../lib/workspace";

export default function WorkspaceHeader({ currentWorkspace, setCurrentWorkspace, setWorkspaces }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentWorkspace?.title || "");
  const [editSubtitle, setEditSubtitle] = useState(currentWorkspace?.subtitle || "");


  const handleSave = async () => {
    const updated = await updateWorkspace(currentWorkspace.id, {
      title: editTitle,
      subtitle: editSubtitle,
    });

    setCurrentWorkspace(updated);
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === updated.id ? updated : ws))
    );

    setEditing(false);
  };

  return (
    <div className="relative mb-6 text-center">
      
      {editing ? (
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="p-2 rounded border text-black"
          />
          <input
            type="text"
            value={editSubtitle}
            onChange={(e) => setEditSubtitle(e.target.value)}
            className="p-2 rounded border text-black"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentWorkspace?.title || "Sans titre"}
            </h1>
            <p className="text-white/70">{currentWorkspace?.subtitle || ""}</p>
            
          </div>
          <button
            onClick={() => {
              setEditTitle(currentWorkspace?.title || "");
              setEditSubtitle(currentWorkspace?.subtitle || "");
              setEditing(true);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-[#e5e0f7] rounded text-black"
          >
            ✏️ Modifier
          </button>
        </div>
      )}
    </div>
  );
}
