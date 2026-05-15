interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export default function SkipLink({ targetId = "main-content", label = "Pular para o conteúdo principal" }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="sr-only sr-only-focusable">
      {label}
    </a>
  );
}
