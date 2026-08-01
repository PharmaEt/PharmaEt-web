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

export interface ApiPosProduct {
  product_id: number;
  name: string;
  category: ApiCategory | null;
  type: "Medicine" | "Cosmetic";
  available_quantity: number;
  selling_price: string;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Mock Branches (matches real GET /branches) ─────────

export const mockBranches: ApiBranch[] = [
  {
    id: 2,
    name: "Hawassa Branch",
    location: "Hawassa Center",
    founded_year: 2025,
    manager_id: 6,
    phone: "+251966778899",
    users: [
      {
        id: 6,
        branch_id: 2,
        name: "Khalid Osman",
        email: "khalid@pharmaet.com",
        phone: "+251977889900",
        role: "manager",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:01.000000Z",
        updated_at: "2026-07-28T22:52:01.000000Z",
      },
      {
        id: 7,
        branch_id: 2,
        name: "Mina Tesfaye",
        email: "mina@pharmaet.com",
        phone: "+251988990011",
        role: "pharmacist",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:02.000000Z",
        updated_at: "2026-07-28T22:52:02.000000Z",
      },
      {
        id: 8,
        branch_id: 2,
        name: "Daniel Kebede",
        email: "daniel@pharmaet.com",
        phone: "+251999001122",
        role: "cashier",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:03.000000Z",
        updated_at: "2026-07-28T22:52:03.000000Z",
      },
    ],
    created_at: "2026-07-28T22:52:01.000000Z",
    updated_at: "2026-07-28T22:52:01.000000Z",
  },
  {
    id: 1,
    name: "Bole Branch",
    location: "Bole Road, Addis Ababa",
    founded_year: 2024,
    manager_id: 2,
    phone: "+251911223344",
    users: [
      {
        id: 2,
        branch_id: 1,
        name: "Ahmed Ali",
        email: "ahmed@pharmaet.com",
        phone: "+251922334455",
        role: "manager",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:51:59.000000Z",
        updated_at: "2026-07-28T22:51:59.000000Z",
      },
      {
        id: 3,
        branch_id: 1,
        name: "Fatima Hassan",
        email: "fatima@pharmaet.com",
        phone: "+251933445566",
        role: "pharmacist",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:00.000000Z",
        updated_at: "2026-07-28T22:52:00.000000Z",
      },
      {
        id: 4,
        branch_id: 1,
        name: "Omar Ibrahim",
        email: "omar@pharmaet.com",
        phone: "+251944556677",
        role: "cashier",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:00.000000Z",
        updated_at: "2026-07-28T22:52:00.000000Z",
      },
      {
        id: 5,
        branch_id: 1,
        name: "Sara Mohammed",
        email: "sara@pharmaet.com",
        phone: "+251955667788",
        role: "inventory_officer",
        status: "active",
        telegram_chat_id: null,
        created_at: "2026-07-28T22:52:01.000000Z",
        updated_at: "2026-07-28T22:52:01.000000Z",
      },
    ],
    created_at: "2026-07-28T22:51:59.000000Z",
    updated_at: "2026-07-28T22:51:59.000000Z",
  },
];

// ─── Mock Users (flattened from branches for pages that need flat list) ──

export const mockUsers: ApiUser[] = [
  {
    id: 1,
    branch_id: null,
    name: "Bilal Ahmed",
    email: "bilal@pharmaet.com",
    phone: "+251911223344",
    role: "owner",
    status: "active",
    telegram_chat_id: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  ...mockBranches.flatMap((b) => b.users),
];

// ─── Mock Suppliers ─────────────────────────────────────

export const mockSuppliers: ApiSupplier[] = [
  {
    id: 1,
    name: "Ethio Pharma Distribution",
    phone: "+251911000001",
    email: "info@ethiopharma.com",
    address: "Addis Ababa, Bole",
    contact_person: "Yonas Bekele",
    telegram_chat_id: "111111111",
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 2,
    name: "Hawassa Medical Supplies",
    phone: "+251911000002",
    email: "contact@hawassamed.com",
    address: "Hawassa, Tita",
    contact_person: "Rahel Tadesse",
    telegram_chat_id: "222222222",
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 3,
    name: "Dire Dawa Pharmaceuticals",
    phone: "+251911000003",
    email: "sales@directpharma.com",
    address: "Dire Dawa",
    contact_person: "Ali Hassan",
    telegram_chat_id: "333333333",
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
];

// ─── Mock Categories (with type field per API) ──────────

export const mockCategories: ApiCategory[] = [
  { id: 1, name: "Pain Relief", slug: "pain-relief", type: "medicine", description: "Medications for pain management", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 2, name: "Antibiotics", slug: "antibiotics", type: "medicine", description: "Antibacterial medications", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 3, name: "Vitamins & Supplements", slug: "vitamins-supplements", type: "medicine", description: "Vitamins, minerals, and dietary supplements", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 4, name: "Cardiovascular", slug: "cardiovascular", type: "medicine", description: "Heart and blood pressure medications", branch_id: 1, status: "active", branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 5, name: "Respiratory", slug: "respiratory", type: "medicine", description: "Medications for respiratory conditions", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 6, name: "Gastrointestinal", slug: "gastrointestinal", type: "medicine", description: "Digestive system medications", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 7, name: "Allergy", slug: "allergy", type: "medicine", description: "Antihistamines and allergy medications", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 8, name: "Diabetes", slug: "diabetes", type: "medicine", description: "Medications for diabetes management", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 9, name: "Skincare", slug: "skincare", type: "cosmetic", description: "Skincare and moisturizing products", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 10, name: "Haircare", slug: "haircare", type: "cosmetic", description: "Shampoo, conditioner, and hair products", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 11, name: "Makeup", slug: "makeup", type: "cosmetic", description: "Cosmetic makeup products", branch_id: null, status: "active", branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
];

// ─── Mock Medicines ─────────────────────────────────────

export const mockMedicines: ApiMedicine[] = [
  { id: 1, product_id: 1, category_id: 1, branch_id: 1, supplier_id: 1, name: "Paracetamol", sku: "PCM-500", barcode: "6901234567890", pack_size: 100, min_stock_alert: 50, description: "Pain reliever and fever reducer", status: "active", generic_name: "Acetaminophen", strength: "500mg", dosage_form: "Tablet", is_prescription_required: false, current_stock: 450, pack_price: 250, unit_price: 25, category: mockCategories[0], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 2, product_id: 2, category_id: 2, branch_id: 1, supplier_id: 1, name: "Amoxicillin", sku: "AMX-500", barcode: "6901234567891", pack_size: 100, min_stock_alert: 30, description: "Antibiotic for bacterial infections", status: "active", generic_name: "Amoxicillin", strength: "500mg", dosage_form: "Capsule", is_prescription_required: true, current_stock: 200, pack_price: 300, unit_price: 30, category: mockCategories[1], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 3, product_id: 3, category_id: 8, branch_id: 1, supplier_id: 1, name: "Metformin", sku: "MET-850", barcode: "6901234567892", pack_size: 60, min_stock_alert: 20, description: "Oral diabetes medicine", status: "active", generic_name: "Metformin Hydrochloride", strength: "850mg", dosage_form: "Tablet", is_prescription_required: true, current_stock: 300, pack_price: 180, unit_price: 18, category: mockCategories[7], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 4, product_id: 4, category_id: 6, branch_id: null, supplier_id: 2, name: "Omeprazole", sku: "OMP-20", barcode: "6901234567893", pack_size: 30, min_stock_alert: 25, description: "Proton pump inhibitor for acid reflux", status: "active", generic_name: "Omeprazole", strength: "20mg", dosage_form: "Capsule", is_prescription_required: false, current_stock: 150, pack_price: 120, unit_price: 12, category: mockCategories[5], branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 5, product_id: 5, category_id: 1, branch_id: 1, supplier_id: 1, name: "Ibuprofen", sku: "IBU-400", barcode: "6901234567894", pack_size: 100, min_stock_alert: 50, description: "Nonsteroidal anti-inflammatory drug", status: "active", generic_name: "Ibuprofen", strength: "400mg", dosage_form: "Tablet", is_prescription_required: false, current_stock: 380, pack_price: 200, unit_price: 20, category: mockCategories[0], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 6, product_id: 6, category_id: 7, branch_id: null, supplier_id: 2, name: "Cetirizine", sku: "CTZ-10", barcode: "6901234567895", pack_size: 30, min_stock_alert: 40, description: "Antihistamine for allergy relief", status: "active", generic_name: "Cetirizine Hydrochloride", strength: "10mg", dosage_form: "Tablet", is_prescription_required: false, current_stock: 250, pack_price: 90, unit_price: 9, category: mockCategories[6], branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 7, product_id: 7, category_id: 4, branch_id: 1, supplier_id: 1, name: "Amlodipine", sku: "AML-5", barcode: "6901234567896", pack_size: 30, min_stock_alert: 20, description: "Calcium channel blocker for hypertension", status: "active", generic_name: "Amlodipine Besylate", strength: "5mg", dosage_form: "Tablet", is_prescription_required: true, current_stock: 180, pack_price: 150, unit_price: 15, category: mockCategories[3], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 8, product_id: 8, category_id: 2, branch_id: 1, supplier_id: 1, name: "Azithromycin", sku: "AZT-250", barcode: "6901234567897", pack_size: 6, min_stock_alert: 20, description: "Macrolide antibiotic", status: "active", generic_name: "Azithromycin", strength: "250mg", dosage_form: "Tablet", is_prescription_required: true, current_stock: 120, pack_price: 180, unit_price: 30, category: mockCategories[1], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 9, product_id: 9, category_id: 4, branch_id: 2, supplier_id: 3, name: "Losartan", sku: "LST-50", barcode: "6901234567898", pack_size: 30, min_stock_alert: 15, description: "Angiotensin receptor blocker", status: "active", generic_name: "Losartan Potassium", strength: "50mg", dosage_form: "Tablet", is_prescription_required: true, current_stock: 90, pack_price: 200, unit_price: 20, category: mockCategories[3], branch: mockBranches[0], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 10, product_id: 10, category_id: 5, branch_id: null, supplier_id: 3, name: "Salbutamol Inhaler", sku: "SAL-100", barcode: "6901234567899", pack_size: 1, min_stock_alert: 10, description: "Bronchodilator for asthma", status: "active", generic_name: "Salbutamol", strength: "100mcg", dosage_form: "Inhaler", is_prescription_required: true, current_stock: 25, pack_price: 350, unit_price: 350, category: mockCategories[4], branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
];

// ─── Mock Cosmetics ────────────────────────────────────

export const mockCosmetics: ApiCosmetic[] = [
  { id: 101, product_id: 101, category_id: 9, branch_id: 1, supplier_id: 2, name: "Nivea Soft Moisturizing Cream", sku: "NIVEA-SOFT-100", barcode: "6902064650039", pack_size: 1, min_stock_alert: 30, description: "Lightweight moisturizing cream for daily use", status: "active", product_type: "Cream", size: "100ml", unit: "tube", color: null, shade: null, ingredients: "Water, Glycerin, Mineral Oil", current_stock: 120, pack_price: 350, unit_price: 350, category: mockCategories[8], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 102, product_id: 102, category_id: 9, branch_id: 1, supplier_id: 2, name: "Vaseline Intensive Care Lotion", sku: "VAS-IC-200", barcode: "6902064650100", pack_size: 1, min_stock_alert: 20, description: "Deep moisture body lotion", status: "active", product_type: "Lotion", size: "200ml", unit: "bottle", color: null, shade: null, ingredients: "Water, Glycerin, Petrolatum", current_stock: 85, pack_price: 420, unit_price: 420, category: mockCategories[8], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 103, product_id: 103, category_id: 10, branch_id: null, supplier_id: 2, name: "Sunsilk Shampoo Black Shine", sku: "SUN-SLK-BLK", barcode: "6902064650200", pack_size: 1, min_stock_alert: 40, description: "Shampoo for black hair shine", status: "active", product_type: "Shampoo", size: "400ml", unit: "bottle", color: "Black", shade: null, ingredients: "Water, Sodium Laureth Sulfate, Fragrance", current_stock: 200, pack_price: 280, unit_price: 280, category: mockCategories[9], branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 104, product_id: 104, category_id: 10, branch_id: 1, supplier_id: 2, name: "Pantene conditioner Smooth", sku: "PAN-CON-SMO", barcode: "6902064650300", pack_size: 1, min_stock_alert: 15, description: "Smooth and silky conditioner", status: "active", product_type: "Conditioner", size: "350ml", unit: "bottle", color: "White", shade: null, ingredients: "Water, Cetyl Alcohol, Stearyl Alcohol", current_stock: 65, pack_price: 310, unit_price: 310, category: mockCategories[9], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 105, product_id: 105, category_id: 11, branch_id: null, supplier_id: 3, name: "Maybelline Fit Me Foundation", sku: "MAY-FM-FND", barcode: "6902064650400", pack_size: 1, min_stock_alert: 10, description: "Matte + poreless foundation", status: "active", product_type: "Makeup", size: "30ml", unit: "bottle", color: "Natural Beige", shade: "128", ingredients: "Water, Dimethicone, Glycerin", current_stock: 40, pack_price: 850, unit_price: 850, category: mockCategories[10], branch: null, created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 106, product_id: 106, category_id: 11, branch_id: 1, supplier_id: 3, name: "Vaseline Lip Therapy", sku: "VAS-LIP-10", barcode: "6902064650500", pack_size: 1, min_stock_alert: 30, description: "Moisturizing lip balm", status: "active", product_type: "Lip Care", size: "10g", unit: "tin", color: "Pink", shade: "Rosy", ingredients: "Petrolatum, Lanolin, Cocoa Butter", current_stock: 180, pack_price: 150, unit_price: 150, category: mockCategories[10], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
];

// ─── Mock POS Products (matches GET /pos/products) ─────

export const mockPosProducts: ApiPosProduct[] = [
  ...mockMedicines.map((m) => ({
    product_id: m.product_id,
    name: m.name,
    category: m.category,
    type: "Medicine" as const,
    available_quantity: m.current_stock,
    selling_price: m.pack_price.toString(),
    details: { generic_name: m.generic_name, strength: m.strength, dosage_form: m.dosage_form, is_prescription_required: m.is_prescription_required },
  })),
  ...mockCosmetics.map((c) => ({
    product_id: c.product_id,
    name: c.name,
    category: c.category,
    type: "Cosmetic" as const,
    available_quantity: c.current_stock,
    selling_price: c.pack_price.toString(),
    details: { product_type: c.product_type, size: c.size, sku: c.sku },
  })),
];

// ─── Mock Stock (matches GET /stock) ───────────────────

export const mockStock: ApiStock[] = [
  { id: 1, branch_id: 1, product_id: 1, supplier_id: 1, purchase_order_id: null, batch_number: "PCM-2026-001", expiry_date: "2027-12-31", quantity: 450, purchase_cost: 2.00, profit_pct: 25, selling_price: 2.50, received_by: 5, product: mockMedicines[0], supplier: mockSuppliers[0], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 2, branch_id: 1, product_id: 2, supplier_id: 1, purchase_order_id: null, batch_number: "AMX-2026-001", expiry_date: "2027-06-30", quantity: 200, purchase_cost: 2.50, profit_pct: 20, selling_price: 3.00, received_by: 5, product: mockMedicines[1], supplier: mockSuppliers[0], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 3, branch_id: 1, product_id: 3, supplier_id: 1, purchase_order_id: null, batch_number: "MET-2026-001", expiry_date: "2027-09-15", quantity: 300, purchase_cost: 1.50, profit_pct: 20, selling_price: 1.80, received_by: 5, product: mockMedicines[2], supplier: mockSuppliers[0], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 4, branch_id: 2, product_id: 9, supplier_id: 3, purchase_order_id: null, batch_number: "LST-2026-001", expiry_date: "2027-11-01", quantity: 90, purchase_cost: 1.60, profit_pct: 25, selling_price: 2.00, received_by: 7, product: mockMedicines[8], supplier: mockSuppliers[2], branch: mockBranches[0], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
  { id: 5, branch_id: 1, product_id: 101, supplier_id: 2, purchase_order_id: null, batch_number: "NIV-2026-001", expiry_date: "2028-01-20", quantity: 120, purchase_cost: 280, profit_pct: 25, selling_price: 350, received_by: 5, product: mockCosmetics[0], supplier: mockSuppliers[1], branch: mockBranches[1], created_at: "2026-07-28T10:00:00.000000Z", updated_at: "2026-07-28T10:00:00.000000Z" },
];

// ─── Mock Sales (matches GET /sales) ───────────────────

export const mockSales: ApiSale[] = [
  { id: 1, branch_id: 1, served_by: mockUsers.find((u) => u.id === 4)!, payment_type: "cash", subtotal: "450.00", tax: "0.00", discount: "0.00", total: "450.00", cash_given: "500.00", change: "50.00", items: [
    { id: 1, stock_id: 1, product_id: 1, quantity: 2, selling_price: "250.00", total: "500.00", product: mockMedicines[0] },
  ], created_at: "2026-07-28T10:30:00.000000Z", updated_at: "2026-07-28T10:30:00.000000Z" },
  { id: 2, branch_id: 1, served_by: mockUsers.find((u) => u.id === 4)!, payment_type: "mobile_money", subtotal: "120.00", tax: "0.00", discount: "10.00", total: "110.00", cash_given: null, change: null, items: [
    { id: 2, stock_id: 3, product_id: 3, quantity: 1, selling_price: "120.00", total: "120.00", product: mockMedicines[2] },
  ], created_at: "2026-07-28T11:15:00.000000Z", updated_at: "2026-07-28T11:15:00.000000Z" },
  { id: 3, branch_id: 1, served_by: mockUsers.find((u) => u.id === 8)!, payment_type: "cash", subtotal: "890.00", tax: "0.00", discount: "0.00", total: "890.00", cash_given: "900.00", change: "10.00", items: [
    { id: 3, stock_id: 1, product_id: 1, quantity: 3, selling_price: "250.00", total: "750.00", product: mockMedicines[0] },
    { id: 4, stock_id: 2, product_id: 2, quantity: 1, selling_price: "300.00", total: "300.00", product: mockMedicines[1] },
  ], created_at: "2026-07-28T11:45:00.000000Z", updated_at: "2026-07-28T11:45:00.000000Z" },
  { id: 4, branch_id: 1, served_by: mockUsers.find((u) => u.id === 4)!, payment_type: "card", subtotal: "340.00", tax: "0.00", discount: "0.00", total: "340.00", cash_given: null, change: null, items: [
    { id: 5, stock_id: 3, product_id: 3, quantity: 2, selling_price: "180.00", total: "360.00", product: mockMedicines[2] },
  ], created_at: "2026-07-28T12:20:00.000000Z", updated_at: "2026-07-28T12:20:00.000000Z" },
  { id: 5, branch_id: 1, served_by: mockUsers.find((u) => u.id === 8)!, payment_type: "cash", subtotal: "670.00", tax: "0.00", discount: "0.00", total: "670.00", cash_given: "700.00", change: "30.00", items: [
    { id: 6, stock_id: 2, product_id: 2, quantity: 2, selling_price: "300.00", total: "600.00", product: mockMedicines[1] },
  ], created_at: "2026-07-28T13:00:00.000000Z", updated_at: "2026-07-28T13:00:00.000000Z" },
];

// ─── Mock Dashboard (matches GET /dashboard) ───────────

export const mockDashboard: ApiDashboard = {
  today: { sales_count: 15, revenue: 4500 },
  month_revenue: 125000,
  total_stock: 25,
  alerts: { low_stock: 3, expiring_soon: 5, expired: 2 },
  recent_sales: mockSales,
};

// ─── Mock Stock Alerts (matches GET /stock/alerts) ──────

export const mockStockAlerts: ApiStockAlerts = {
  low_stock: [
    { branch_id: 1, product: mockMedicines[9], quantity: 25, min_stock_alert: 10 },
    { branch_id: 1, product: mockMedicines[7], quantity: 120, min_stock_alert: 20 },
    { branch_id: 2, product: mockMedicines[8], quantity: 90, min_stock_alert: 15 },
  ],
  expiring_soon: [mockStock[1]],
  expired: [],
};

// ─── Mock Purchase Orders (matches GET /purchase-orders) ──

export const mockPurchaseOrders: ApiPurchaseOrder[] = [
  {
    id: 1, branch_id: 1, supplier_id: 1, order_date: "2026-07-25", note: "Monthly restock", status: "ordered",
    items: [
      { id: 1, product_id: 1, quantity_pack: 50, cost_per_pack: 100, total_cost: 5000, received_quantity: 0, product: mockMedicines[0] },
      { id: 2, product_id: 2, quantity_pack: 30, cost_per_pack: 250, total_cost: 7500, received_quantity: 0, product: mockMedicines[1] },
    ],
    supplier: mockSuppliers[0], created_by: mockUsers.find((u) => u.id === 5)!, branch: mockBranches[1], created_at: "2026-07-25T10:00:00.000000Z", updated_at: "2026-07-25T10:00:00.000000Z",
  },
];

// ─── Legacy mockSales for dashboard (flat format) ──────

export const mockDashboardSales = [
  { id: 1, time: "10:30 AM", items: 3, total: 450, payment: "Cash", served_by: "Omar Ibrahim", status: "completed" },
  { id: 2, time: "11:15 AM", items: 1, total: 120, payment: "Telebirr", served_by: "Omar Ibrahim", status: "completed" },
  { id: 3, time: "11:45 AM", items: 5, total: 890, payment: "Cash", served_by: "Daniel Kebede", status: "completed" },
  { id: 4, time: "12:20 PM", items: 2, total: 340, payment: "CBE Birr", served_by: "Omar Ibrahim", status: "completed" },
  { id: 5, time: "01:00 PM", items: 4, total: 670, payment: "Cash", served_by: "Daniel Kebede", status: "completed" },
  { id: 6, time: "01:30 PM", items: 1, total: 85, payment: "Telebirr", served_by: "Omar Ibrahim", status: "completed" },
  { id: 7, time: "02:15 PM", items: 6, total: 1200, payment: "Cash", served_by: "Daniel Kebede", status: "completed" },
  { id: 8, time: "02:45 PM", items: 2, total: 290, payment: "CBE Birr", served_by: "Omar Ibrahim", status: "completed" },
  { id: 9, time: "03:30 PM", items: 3, total: 520, payment: "Cash", served_by: "Daniel Kebede", status: "pending" },
  { id: 10, time: "04:00 PM", items: 1, total: 150, payment: "Telebirr", served_by: "Omar Ibrahim", status: "completed" },
];

// ─── Mock Stock Movements (matches GET /stock-movements) ──

export const mockStockMovements: ApiStockMovement[] = [
  { id: 1, stock_id: 1, product_id: 1, type: "purchase", quantity: 200, notes: "PO-001 delivery", user: mockUsers.find((u) => u.id === 5)!, product: mockMedicines[0], stock: mockStock[0], created_at: "2026-07-28T09:00:00.000000Z", updated_at: "2026-07-28T09:00:00.000000Z" },
  { id: 2, stock_id: 1, product_id: 1, type: "sale", quantity: 15, notes: "POS sale SALE-042", user: mockUsers.find((u) => u.id === 4)!, product: mockMedicines[0], stock: mockStock[0], created_at: "2026-07-28T10:30:00.000000Z", updated_at: "2026-07-28T10:30:00.000000Z" },
  { id: 3, stock_id: 2, product_id: 2, type: "purchase", quantity: 100, notes: "PO-001 delivery", user: mockUsers.find((u) => u.id === 5)!, product: mockMedicines[1], stock: mockStock[1], created_at: "2026-07-28T09:00:00.000000Z", updated_at: "2026-07-28T09:00:00.000000Z" },
  { id: 4, stock_id: 2, product_id: 2, type: "sale", quantity: 10, notes: "POS sale SALE-039", user: mockUsers.find((u) => u.id === 8)!, product: mockMedicines[1], stock: mockStock[1], created_at: "2026-07-27T14:00:00.000000Z", updated_at: "2026-07-27T14:00:00.000000Z" },
  { id: 5, stock_id: 3, product_id: 3, type: "purchase", quantity: 50, notes: "PO-002 restock", user: mockUsers.find((u) => u.id === 5)!, product: mockMedicines[2], stock: mockStock[2], created_at: "2026-07-27T08:30:00.000000Z", updated_at: "2026-07-27T08:30:00.000000Z" },
  { id: 6, stock_id: 1, product_id: 1, type: "sale", quantity: 8, notes: "POS sale SALE-035", user: mockUsers.find((u) => u.id === 4)!, product: mockMedicines[0], stock: mockStock[0], created_at: "2026-07-26T15:00:00.000000Z", updated_at: "2026-07-26T15:00:00.000000Z" },
  { id: 7, stock_id: 4, product_id: 9, type: "transfer_in", quantity: 30, notes: "Transfer from Bole Branch", user: mockUsers.find((u) => u.id === 6)!, product: mockMedicines[8], stock: mockStock[3], created_at: "2026-07-26T11:00:00.000000Z", updated_at: "2026-07-26T11:00:00.000000Z" },
  { id: 8, stock_id: 5, product_id: 101, type: "purchase", quantity: 120, notes: "PO-003 delivery", user: mockUsers.find((u) => u.id === 5)!, product: mockCosmetics[0], stock: mockStock[4], created_at: "2026-07-25T10:00:00.000000Z", updated_at: "2026-07-25T10:00:00.000000Z" },
  { id: 9, stock_id: 1, product_id: 1, type: "return", quantity: 5, notes: "Customer return - damaged packaging", user: mockUsers.find((u) => u.id === 4)!, product: mockMedicines[0], stock: mockStock[0], created_at: "2026-07-25T14:30:00.000000Z", updated_at: "2026-07-25T14:30:00.000000Z" },
  { id: 10, stock_id: 3, product_id: 3, type: "adjustment", quantity: -3, notes: "Inventory count correction", user: mockUsers.find((u) => u.id === 5)!, product: mockMedicines[2], stock: mockStock[2], created_at: "2026-07-25T16:00:00.000000Z", updated_at: "2026-07-25T16:00:00.000000Z" },
];

// ─── Legacy mockAlerts (flat format for dashboard) ─────

export const mockAlerts = [
  { id: 1, medicine: "Amoxicillin 500mg", type: "low_stock" as const, detail: "5 packs left", severity: "high" as const },
  { id: 2, medicine: "Paracetamol 500mg", type: "expiring" as const, detail: "Expires in 12 days", severity: "medium" as const },
  { id: 3, medicine: "Metformin 850mg", type: "low_stock" as const, detail: "2 packs left", severity: "high" as const },
  { id: 4, medicine: "Omeprazole 20mg", type: "expiring" as const, detail: "Expires in 8 days", severity: "high" as const },
  { id: 5, medicine: "Ibuprofen 400mg", type: "low_stock" as const, detail: "3 packs left", severity: "medium" as const },
];
