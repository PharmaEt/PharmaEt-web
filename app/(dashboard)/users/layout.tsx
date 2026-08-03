import { RoleGuard } from "@/components/role-guard";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner", "manager"]}>{children}</RoleGuard>;
}
