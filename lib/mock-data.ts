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
  description: string | null;
  branch_id: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  branch: ApiBranch | null;
}

export interface ApiMedicine {
  id: number;
  category_id: number;
  branch_id: number | null;
  name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  pack_size: number;
  pack_price: number;
  unit_price: number;
  current_stock: number;
  description: string | null;
  is_prescription_required: boolean;
  min_stock_alert: number;
  status: "active" | "inactive";
  category: ApiCategory | null;
  branch: ApiBranch | null;
  created_at: string;
  updated_at: string;
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

// ─── Mock Categories ────────────────────────────────────

export const mockCategories: ApiCategory[] = [
  {
    id: 1,
    name: "Pain Relief",
    slug: "pain-relief",
    description: "Medications for pain management",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 2,
    name: "Antibiotics",
    slug: "antibiotics",
    description: "Antibacterial medications",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 3,
    name: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    description: "Vitamins, minerals, and dietary supplements",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 4,
    name: "Cardiovascular",
    slug: "cardiovascular",
    description: "Heart and blood pressure medications",
    branch_id: 1,
    status: "active",
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 5,
    name: "Respiratory",
    slug: "respiratory",
    description: "Medications for respiratory conditions",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 6,
    name: "Gastrointestinal",
    slug: "gastrointestinal",
    description: "Digestive system medications",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 7,
    name: "Allergy",
    slug: "allergy",
    description: "Antihistamines and allergy medications",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 8,
    name: "Diabetes",
    slug: "diabetes",
    description: "Medications for diabetes management",
    branch_id: null,
    status: "active",
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
];

// ─── Mock Medicines ─────────────────────────────────────

export const mockMedicines: ApiMedicine[] = [
  {
    id: 1,
    category_id: 1,
    branch_id: 1,
    name: "Paracetamol",
    generic_name: "Acetaminophen",
    strength: "500mg",
    dosage_form: "Tablet",
    pack_size: 100,
    pack_price: 250,
    unit_price: 25,
    current_stock: 450,
    description: "Pain reliever and fever reducer",
    is_prescription_required: false,
    min_stock_alert: 50,
    status: "active",
    category: mockCategories[0],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 2,
    category_id: 2,
    branch_id: 1,
    name: "Amoxicillin",
    generic_name: "Amoxicillin",
    strength: "500mg",
    dosage_form: "Capsule",
    pack_size: 100,
    pack_price: 300,
    unit_price: 30,
    current_stock: 200,
    description: "Antibiotic for bacterial infections",
    is_prescription_required: true,
    min_stock_alert: 30,
    status: "active",
    category: mockCategories[1],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 3,
    category_id: 8,
    branch_id: 1,
    name: "Metformin",
    generic_name: "Metformin Hydrochloride",
    strength: "850mg",
    dosage_form: "Tablet",
    pack_size: 60,
    pack_price: 180,
    unit_price: 18,
    current_stock: 300,
    description: "Oral diabetes medicine",
    is_prescription_required: true,
    min_stock_alert: 20,
    status: "active",
    category: mockCategories[7],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 4,
    category_id: 6,
    branch_id: null,
    name: "Omeprazole",
    generic_name: "Omeprazole",
    strength: "20mg",
    dosage_form: "Capsule",
    pack_size: 30,
    pack_price: 120,
    unit_price: 12,
    current_stock: 150,
    description: "Proton pump inhibitor for acid reflux",
    is_prescription_required: false,
    min_stock_alert: 25,
    status: "active",
    category: mockCategories[5],
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 5,
    category_id: 1,
    branch_id: 1,
    name: "Ibuprofen",
    generic_name: "Ibuprofen",
    strength: "400mg",
    dosage_form: "Tablet",
    pack_size: 100,
    pack_price: 200,
    unit_price: 20,
    current_stock: 380,
    description: "Nonsteroidal anti-inflammatory drug",
    is_prescription_required: false,
    min_stock_alert: 50,
    status: "active",
    category: mockCategories[0],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 6,
    category_id: 7,
    branch_id: null,
    name: "Cetirizine",
    generic_name: "Cetirizine Hydrochloride",
    strength: "10mg",
    dosage_form: "Tablet",
    pack_size: 30,
    pack_price: 90,
    unit_price: 9,
    current_stock: 250,
    description: "Antihistamine for allergy relief",
    is_prescription_required: false,
    min_stock_alert: 40,
    status: "active",
    category: mockCategories[6],
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 7,
    category_id: 4,
    branch_id: 1,
    name: "Amlodipine",
    generic_name: "Amlodipine Besylate",
    strength: "5mg",
    dosage_form: "Tablet",
    pack_size: 30,
    pack_price: 150,
    unit_price: 15,
    current_stock: 180,
    description: "Calcium channel blocker for hypertension",
    is_prescription_required: true,
    min_stock_alert: 20,
    status: "active",
    category: mockCategories[3],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 8,
    category_id: 2,
    branch_id: 1,
    name: "Azithromycin",
    generic_name: "Azithromycin",
    strength: "250mg",
    dosage_form: "Tablet",
    pack_size: 6,
    pack_price: 180,
    unit_price: 30,
    current_stock: 120,
    description: "Macrolide antibiotic",
    is_prescription_required: true,
    min_stock_alert: 20,
    status: "active",
    category: mockCategories[1],
    branch: mockBranches[1],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 9,
    category_id: 4,
    branch_id: 2,
    name: "Losartan",
    generic_name: "Losartan Potassium",
    strength: "50mg",
    dosage_form: "Tablet",
    pack_size: 30,
    pack_price: 200,
    unit_price: 20,
    current_stock: 90,
    description: "Angiotensin receptor blocker",
    is_prescription_required: true,
    min_stock_alert: 15,
    status: "active",
    category: mockCategories[3],
    branch: mockBranches[0],
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
  {
    id: 10,
    category_id: 5,
    branch_id: null,
    name: "Salbutamol Inhaler",
    generic_name: "Salbutamol",
    strength: "100mcg",
    dosage_form: "Inhaler",
    pack_size: 1,
    pack_price: 350,
    unit_price: 350,
    current_stock: 25,
    description: "Bronchodilator for asthma",
    is_prescription_required: true,
    min_stock_alert: 10,
    status: "active",
    category: mockCategories[4],
    branch: null,
    created_at: "2026-07-28T10:00:00.000000Z",
    updated_at: "2026-07-28T10:00:00.000000Z",
  },
];

// ─── Mock Sales ─────────────────────────────────────────

export const mockSales = [
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

// ─── Mock Alerts ────────────────────────────────────────

export const mockAlerts = [
  { id: 1, medicine: "Amoxicillin 500mg", type: "low_stock" as const, detail: "5 packs left", severity: "high" as const },
  { id: 2, medicine: "Paracetamol 500mg", type: "expiring" as const, detail: "Expires in 12 days", severity: "medium" as const },
  { id: 3, medicine: "Metformin 850mg", type: "low_stock" as const, detail: "2 packs left", severity: "high" as const },
  { id: 4, medicine: "Omeprazole 20mg", type: "expiring" as const, detail: "Expires in 8 days", severity: "high" as const },
  { id: 5, medicine: "Ibuprofen 400mg", type: "low_stock" as const, detail: "3 packs left", severity: "medium" as const },
];
