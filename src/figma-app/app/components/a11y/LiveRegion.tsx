import { ReactNode } from "react";

interface LiveRegionProps {
  children: ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}

export default function LiveRegion({ children, politeness = "polite", atomic = true }: LiveRegionProps) {
  return (
    <div role="status" aria-live={politeness} aria-atomic={atomic} className="sr-only">
      {children}
    </div>
  );
}
