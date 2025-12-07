import React, { useState } from "react";
import { deleteBL } from "../lib/facture";

export default function DocumentList({ documents, workspaceId, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDelete = async (docId) => {
    await deleteBL(docId);
    setConfirmDeleteId(null);
    if (onDelete) onDelete(docId);
  };

  return (
    <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Bons de livraison déposés</h3>
      <ul>
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <li key={doc.id} className="text-white flex items-center justify-between">
              <a
                href={`http://localhost:8000/uploads/workspace_${workspaceId}/bl/${doc.original_filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {doc.original_filename}
              </a>
              {/* Si on n'a pas encore cliqué sur supprimer */}
              {confirmDeleteId !== doc.id ? (
                <button
                  className="text-red-500 hover:text-red-700 ml-4"
                  title="Supprimer"
                  onClick={() => setConfirmDeleteId(doc.id)}
                >
                  🗑️
                </button>
              ) : (
                // Confirmation affichée après clic sur 🗑️
                <div className="ml-4 flex gap-2 items-center">
                  <span className="text-sm text-white/80">
                    Confirmer ? ( attention, cette action est irréversible )
                  </span>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    onClick={async () => await handleDelete(doc.id)}
                    
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
              )}
            </li>
          ))
        ) : (
          <li className="text-white/80">
            Aucun bon de livraison déposé.
          </li>
        )}
      </ul>
    </div>
  );
}
