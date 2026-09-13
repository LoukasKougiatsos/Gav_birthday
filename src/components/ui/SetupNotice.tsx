export function SetupNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-ink/60">
      <span className="font-medium text-clay">Θέλει ρύθμιση — </span>
      {children}
    </p>
  );
}
