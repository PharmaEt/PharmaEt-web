import { RoleGuard } from "@/components/role-guard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner"]}>{children}</RoleGuard>;
}
