export function ThinDivider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`h-px w-full border-none bg-black ${className}`}
      aria-hidden="true"
    />
  );
}

