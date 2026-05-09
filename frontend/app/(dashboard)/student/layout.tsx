import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function StudentSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allow={[ROLES.STUDENT]}>{children}</AuthGuard>;
}
