// src/components/CreateWorkspaceModal.jsx
import React, { useState } from "react";

export default function CreateWorkspaceModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }
    onCreate({
      title,
      subtitle: subtitle || "Sans sous-titre",
      date: date || new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Créer un nouveau dossier</h2>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          placeholder="Sous-titre"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#a18aff] text-white rounded"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
