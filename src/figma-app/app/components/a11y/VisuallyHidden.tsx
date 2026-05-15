import { ElementType, ReactNode, createElement } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: ElementType;
}

export default function VisuallyHidden({ children, as = "span" }: VisuallyHiddenProps) {
  return createElement(as, { className: "sr-only" }, children);
}
