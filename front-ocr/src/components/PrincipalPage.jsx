import React from "react";

export default function PrincipalPage() {
  return (
    <div className="ml-24 flex-1 min-h-screen p-12 flex flex-col items-center overflow-y-auto">
        <h2 className="w-full text-5xl text-white mb-6 font-bold text-center">
          Aucun dossier trouvé
        </h2>
      <p className="text-white/80 mb-8">
        Clique sur <span className="font-bold">Nouveau</span> dans la barre
        latérale pour créer ton premier dossier.
      </p>
    </div>
  );
}
