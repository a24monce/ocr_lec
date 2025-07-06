import axios from 'axios';

export async function getFactures() {
  const res = await axios.get(import.meta.env.VITE_API_URL + '/workspaces/1');
  return res.data.facture_globale ? [res.data.facture_globale] : [];
}