import { RoleGuard } from "@/components/role-guard";

export default function BranchesLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner"]}>{children}</RoleGuard>;
}
