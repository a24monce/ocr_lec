import React, { useState } from "react";

export default function FactureList({ document, workspaceId, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // stocke l'ID de la facture à confirmer
  const [documents, setDocuments] = useState(document || []); // état local pour la liste des factures


  return (
    <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-white">
        Facture globale déposée
      </h3>
      <ul>
        {document && document.length > 0 ? (
          document.map((doc) => (
            <li
              key={doc.id}
              className="text-white flex items-center justify-between mb-2"
            >
              <a
                href={`http://localhost:8000/uploads/workspace_${workspaceId}/facture/${doc.original_filename}`}
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
                    onClick={async () => {
                      await onDelete(doc.id);
                      await setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                      await setConfirmDeleteId(null);
                    }}
                  >
                    Oui
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                    onClick={async () => {
                      await setConfirmDeleteId(null);
                    }}
                  >
                    Non
                  </button>
                  
                </div>
              )}
            </li>
          ))
        ) : (
          <li className="text-white/80">
            Vous n'avez pas encore déposé la facture globale.
          </li>
        )}
      </ul>
    </div>
  );
}
