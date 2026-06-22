// handlers/handlefacture.js
import { uploadFacture, getFacture } from "../lib/facture";

export async function handleFactureFileChange(e, activeId, setCurrentWorkspace) {
  if (!activeId) {
    alert("Crée ou sélectionne un workspace avant d’ajouter une facture");
    return;
  }

  const file = e.target.files[0];
  if (!file) return;

  try {
    // Upload (que ce soit remplacement ou ajout)
    await uploadFacture(activeId, file);

    // Recharge la liste depuis le backend
    const factureList = await getFacture(activeId);

    // Mets à jour le workspace avec la nouvelle liste
    setCurrentWorkspace((prev) => ({
      ...prev,
      facture_globale: factureList,   
    }));
  } catch (err) {
    console.error("Erreur upload facture:", err);
    alert(`Erreur upload de ${file.name}`);
  }

  // reset du champ input
  e.target.value = "";
}
