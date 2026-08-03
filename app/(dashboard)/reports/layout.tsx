import { RoleGuard } from "@/components/role-guard";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner", "manager"]}>{children}</RoleGuard>;
}
