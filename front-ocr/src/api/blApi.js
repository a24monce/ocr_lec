import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchBLs() {
  const response = await axios.get(`${API_URL}/bls`);
  return response.data;
}

export async function uploadBL(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_URL}/bls/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}