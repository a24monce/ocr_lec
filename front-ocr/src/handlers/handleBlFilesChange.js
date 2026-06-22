// handlers/handlebl.js
import { uploadDocument, getBL } from "../lib/facture";

export async function handleBlFilesChange(e, activeId, setCurrentWorkspace) {
  if (!activeId) {
    alert("Crée ou sélectionne un workspace avant d’ajouter un BL");
    return;
  }

  const files = Array.from(e.target.files);
  for (const file of files) {
    try {
      await uploadDocument(activeId, file);
    } catch {
      alert(`Erreur upload de ${file.name}`);
    }
  }

  // Recharge la liste des BL
  const blList = await getBL(activeId);
  setCurrentWorkspace((prev) => ({
    ...prev,
    documents: blList,
  }));

  e.target.value = "";
}
