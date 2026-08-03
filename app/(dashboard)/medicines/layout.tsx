import { RoleGuard } from "@/components/role-guard";

export default function MedicinesLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["owner", "manager", "pharmacist", "inventory_officer"]}>{children}</RoleGuard>;
}
