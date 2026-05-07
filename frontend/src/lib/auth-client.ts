import { createAuthClient } from "better-auth/client";
import { createAuthClient as createReactAuthClient } from "better-auth/react";

const baseAuthClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

const reactAuthClient = createReactAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

export { baseAuthClient, reactAuthClient };
