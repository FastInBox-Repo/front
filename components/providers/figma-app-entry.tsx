"use client";

import dynamic from "next/dynamic";

const FigmaMakeApp = dynamic(() => import("@/src/figma-app/FigmaMakeApp"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-sm font-medium text-gray-500">Carregando FastInBox...</div>
    </main>
  ),
});

export function FigmaAppEntry() {
  return <FigmaMakeApp />;
}
