import { API_BASE_URL } from '../config';

export async function check_facture_in_bl(workspaceId) {
    const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/check-facture-in-bl`, {
      method: "POST",
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Erreur serveur");
    }
    return res.json();
  }

export async function uploadDocument(workspaceId, file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/bl/`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) throw new Error('Erreur lors de l\'upload du document');
    return res.json();
}
  
export async function uploadFacture(workspaceId, file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/facture-globale/`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) throw new Error('Erreur lors de l\'upload de la facture');
    return res.json();
}

export async function deleteFacture(workspaceId, file) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/facture-globale/${file}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la facture');
  return res.json();
}

export async function deleteBL(workspaceId, file) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/bl/${file}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du BL');
  return res.json();
}

export async function getFacture(workspaceId) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/facture-globale/`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération de la facture');
  return res.json();
}

export async function getBL(workspaceId) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/bl/`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des BL');
  return res.json();
}
