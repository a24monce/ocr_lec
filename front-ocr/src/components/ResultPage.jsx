import React from "react";
import logo from "../assets/logo-osplus.png"; 
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function ResultPage({onNewWorkspace, onShowSearch, resultats }) {

  const [showSearch, setShowSearch] = useState(true);

  const onBack = () => {
    setShowSearch(false);
    onShowSearch(false);
  };

  return (
    <div className="bg-[#a18aff] min-h-screen w-full flex">


      <Sidebar
        logo={logo}
        onNewWorkspace={onNewWorkspace}
        onShowSearch={onShowSearch}
        showSearch={showSearch}
      />

      {/* Contenu principal scrollable */}
      <div className="ml-24 flex-1 min-h-screen p-12 flex flex-col items-center">
        <div className="bg-white text-black p-8 rounded-lg shadow max-w-2xl w-full flex flex-col gap-6">
          <img src={logo} alt="Logo OS+" className="w-24 self-center mb-4" />
          <h2 className="text-xl font-bold text-center">
            Résultat de la comparaison
          </h2>

          {resultats && (
            <div className="space-y-6">
              {/* Numéros détectés */}
              <div>
                <h3 className="font-semibold mb-2">
                  Numéros de BL détectés dans la facture :
                </h3>
                <p className="text-sm text-gray-700 break-words">
                  {resultats["Les numéros de BL détectés dans la facture globale"].join(", ")}
                </p>
              </div>

              {/* BL trouvés */}
              <div>
                <h3 className="font-semibold mb-2 text-green-600">
                  ✅ BL trouvés :
                </h3>
                {resultats["Les bons de livraison présents"].length > 0 ? (
                  <ul className="list-disc pl-6">
                    {resultats["Les bons de livraison présents"].map((bl, i) => (
                      <li key={i} className="text-green-600 font-mono">{bl}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Aucun BL trouvé</p>
                )}
              </div>

              {/* BL manquants */}
              <div>
                <h3 className="font-semibold mb-2 text-red-600">
                  ❌ BL manquants ({resultats["Il manque"]}) :
                </h3>
                {resultats["Bons de livraison manquants"].length > 0 ? (
                  <ul className="list-disc pl-6">
                    {resultats["Bons de livraison manquants"].map((bl, i) => (
                      <li key={i} className="text-red-600 font-mono">{bl}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Aucun BL manquant</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="mt-6 px-8 py-3 bg-[#b6aaff] text-white rounded-full font-bold"
          onClick={onBack}
        >
          Retour
        </button>
      </div>
    </div>
  );
}
