import { AuthGuard } from "@/components/auth/auth-guard";
import { ROLES } from "@/lib/constants";

export default function InstructorSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allow={[ROLES.INSTRUCTOR]}>{children}</AuthGuard>;
}
