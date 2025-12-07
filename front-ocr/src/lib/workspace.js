import { API_BASE_URL } from '../config';

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function listWorkspaces() {
  const res = await fetch(`${API_BASE_URL}/`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des workspaces');
  return res.json();
}

export async function getWorkspace(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du workspace');
  return res.json();
}

export async function createWorkspace(payload) {
  const res = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du workspace');
  return res.json();
}

export async function updateWorkspace(id, payload) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du workspace');
  return res.json();
}

export async function deleteWorkspace(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression du workspace');
  return res.json();
}






