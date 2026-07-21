import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export async function getRevenueDashboard(payload: any) {
  const response = await api.post("/revenue", payload);
  console.log("API Response", response.data);
  return response.data;
}