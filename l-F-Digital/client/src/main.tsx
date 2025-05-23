import { createRoot } from "react-dom/client";
import { AIProvider } from "./context/AIContext";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AIProvider>
      <App />
    </AIProvider>
  </QueryClientProvider>
);
