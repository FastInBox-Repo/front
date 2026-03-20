"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0a0a0a",
          color: "#ffffff",
          border: "1px solid #262626",
          borderRadius: "8px",
          fontSize: "14px",
        },
      }}
    />
  );
}
