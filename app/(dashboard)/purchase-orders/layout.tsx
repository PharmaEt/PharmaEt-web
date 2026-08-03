import { RoleGuard } from "@/components/role-guard";

export default function PurchaseOrdersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner", "manager", "inventory_officer"]}>{children}</RoleGuard>;
}
