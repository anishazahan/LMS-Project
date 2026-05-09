import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <main className="container max-w-3xl py-8">{children}</main>
    </AuthGuard>
  );
}
