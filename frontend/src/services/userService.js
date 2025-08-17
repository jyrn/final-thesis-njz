import api from "../lib/api";

export const getProfile = () => api.get("/api/users/profile").then(r => r.data);
export const saveProfile = (payload) => api.post("/api/users/profile", payload).then(r => r.data);
