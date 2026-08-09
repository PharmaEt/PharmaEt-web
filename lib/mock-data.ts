// ─── Types ──────────────────────────────────────────────

export interface ApiUser {
  id: number;
  branch_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  role: "owner" | "manager" | "cashier" | "pharmacist" | "inventory_officer";
  status: "active" | "inactive";
  telegram_chat_id: string | null;
  branch?: ApiBranch | null;
  created_at: string;
  updated_at: string;
}

export interface ApiBranch {
  id: number;
  name: string;
  location: string | null;
  founded_year: number | null;
  manager_id: number | null;
  phone: string | null;
  users: ApiUser[];
  created_at: string;
  updated_at: string;
}

export interface ApiSupplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contact_person: string | null;
  telegram_chat_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  type: "medicine" | "cosmetic";
  description: string | null;
  branch_id: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  branch: ApiBranch | null;
}

export interface ApiMedicine {
  id: number;
  product_id: number;
  category_id: number;
  branch_id: number | null;
  supplier_id: number | null;
  name: string;
  sku: string;
  barcode: string | null;
  pack_size: number;
  min_stock_alert: number;
  description: string | null;
  status: "active" | "inactive";
  generic_name: string;
  strength: string;
  dosage_form: string;
  is_prescription_required: boolean;
  current_stock: number;
  pack_price: number;
  unit_price: number;
  category: ApiCategory | null;
  branch: ApiBranch | null;
  created_at: string;
  updated_at: string;
}

export interface ApiCosmetic {
  id: number;
  product_id: number;
  category_id: number;
  branch_id: number | null;
  supplier_id: number | null;
  name: string;
  sku: string;
  barcode: string | null;
  pack_size: number;
  min_stock_alert: number;
  description: string | null;
  status: "active" | "inactive";
  product_type: string;
  size: string | null;
  unit: string | null;
  color: string | null;
  shade: string | null;
  ingredients: string | null;
  current_stock: number;
  pack_price: number;
  unit_price: number;
  category: ApiCategory | null;
  branch: ApiBranch | null;
  created_at: string;
  updated_at: string;
}

export interface ApiProduct {
  id: number;
  category_id: number;
  branch_id: number | null;
  supplier_id: number | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  pack_size: number;
  min_stock_alert: number;
  description: string | null;
  status: "active" | "inactive";
  productable_type: string;
  productable_id: number;
  productable?: Record<string, unknown> | null;
  category?: ApiCategory | null;
  branch?: ApiBranch | null;
  supplier?: ApiSupplier | null;
  created_at: string;
  updated_at: string;
}

export interface ApiPosProduct {
  product_id: number;
  name: string;
  category: ApiCategory | null;
  type: "Medicine" | "Cosmetic";
  available_quantity: number;
  selling_price: string;
  pack_size: number;
  pack_selling_price: number;
  fefo_stock_id?: number | null;
  earliest_expiry_date?: string | null;
  details: {
    generic_name?: string;
    strength?: string;
    dosage_form?: string;
    is_prescription_required?: boolean;
    product_type?: string;
    size?: string | null;
    sku?: string;
  };
}

export interface ApiStockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  stock_id?: number | null;
  requested_quantity: number;
  sent_quantity: number;
  received_quantity: number;
  product?: ApiMedicine | ApiCosmetic;
}

export interface ApiStockTransfer {
  id: number;
  transfer_number: string;
  from_branch_id: number;
  to_branch_id: number;
  requested_by: number;
  approved_by?: number | null;
  status: "requested" | "approved" | "dispatched" | "received" | "rejected";
  notes?: string | null;
  dispatched_at?: string | null;
  received_at?: string | null;
  from_branch?: ApiBranch;
  to_branch?: ApiBranch;
  requested_by_user?: ApiUser;
  approved_by_user?: ApiUser;
  items: ApiStockTransferItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiStock {
  id: number;
  branch_id: number;
  product_id: number;
  supplier_id: number | null;
  purchase_order_id: number | null;
  batch_number: string | null;
  expiry_date: string | null;
  quantity: number;
  purchase_cost: number;
  profit_pct: number | null;
  selling_price: number;
  received_by: number;
  product: ApiMedicine | ApiCosmetic;
  supplier: ApiSupplier | null;
  branch: ApiBranch;
  created_at: string;
  updated_at: string;
}

export interface ApiStockAlerts {
  low_stock: Array<{
    branch_id: number;
    product: ApiMedicine | ApiCosmetic;
    quantity: number;
    min_stock_alert: number;
  }>;
  expiring_soon: ApiStock[];
  expired: ApiStock[];
}

export interface ApiSaleItem {
  id: number;
  stock_id: number;
  product_id: number;
  quantity: number;
  selling_price: string;
  total: string;
  product: ApiMedicine | ApiCosmetic;
}

export interface ApiSale {
  id: number;
  branch_id: number;
  served_by: ApiUser;
  payment_type: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  cash_given: string | null;
  change: string | null;
  items: ApiSaleItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiStockMovement {
  id: number;
  stock_id: number;
  product_id: number;
  type: "purchase" | "sale" | "return" | "adjustment" | "transfer_in" | "transfer_out";
  quantity: number;
  notes: string | null;
  user: ApiUser;
  product: ApiMedicine | ApiCosmetic;
  stock: ApiStock;
  created_at: string;
  updated_at: string;
}

export interface ApiPurchaseOrderItem {
  id: number;
  product_id: number;
  quantity_pack: number;
  cost_per_pack: number;
  total_cost: number;
  received_quantity: number;
  product: ApiMedicine | ApiCosmetic;
}

export interface ApiPurchaseOrder {
  id: number;
  branch_id: number;
  supplier_id: number;
  order_date: string;
  note: string | null;
  status: "draft" | "pending" | "ordered" | "partially_received" | "received" | "cancelled";
  items: ApiPurchaseOrderItem[];
  supplier: ApiSupplier;
  created_by: ApiUser;
  branch: ApiBranch;
  created_at: string;
  updated_at: string;
}

export interface ApiDashboard {
  today: {
    sales_count: number;
    revenue: number;
  };
  month_revenue: number;
  total_stock: number;
  alerts: {
    low_stock: number;
    expiring_soon: number;
    expired: number;
  };
  recent_sales: ApiSale[];
}

// ─── Empty Mock Fallback Arrays ──────────────────────────────────────────

export const mockBranches: ApiBranch[] = [];
export const mockUsers: ApiUser[] = [];
export const mockSuppliers: ApiSupplier[] = [];
export const mockCategories: ApiCategory[] = [];
export const mockMedicines: ApiMedicine[] = [];
export const mockCosmetics: ApiCosmetic[] = [];
export const mockPosProducts: ApiPosProduct[] = [];
export const mockStock: ApiStock[] = [];
export const mockSales: ApiSale[] = [];
export const mockDashboard: ApiDashboard = {
  today: { sales_count: 0, revenue: 0 },
  month_revenue: 0,
  total_stock: 0,
  alerts: { low_stock: 0, expiring_soon: 0, expired: 0 },
  recent_sales: [],
};
export const mockStockAlerts: ApiStockAlerts = {
  low_stock: [],
  expiring_soon: [],
  expired: [],
};
export const mockPurchaseOrders: ApiPurchaseOrder[] = [];
export const mockDashboardSales: any[] = [];
export const mockStockMovements: ApiStockMovement[] = [];
export const mockAlerts: any[] = [];
