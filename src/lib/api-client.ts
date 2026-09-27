// api-client.ts — fully implemented in Step 6.
// Axios instance + JWT Bearer attach + 401 refresh flow + envelope unwrap.

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
});

export default api;
