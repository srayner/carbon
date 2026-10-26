const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--color-accent),var(--color-background)_70%)]">
      {children}
    </div>
  );
};

export default AuthLayout;
