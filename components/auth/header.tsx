import LogoMark from "@/components/logo-mark";

interface HeaderProps {
  label: string;
}

export function Header({ label }: HeaderProps) {
  return (
    <div className="w-full flex flex-col gap-y-3 items-center justify-center">
      <LogoMark className="size-12 text-foreground" />
      <h1 className="text-3xl font-semibold tracking-tight">Carbon</h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
