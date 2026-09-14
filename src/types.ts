export interface Product {
  id: string;
  name: string;
  category: 'Security Software' | 'Developer Hardware' | 'Audit Services' | 'CI/CD Tools';
  price: number;
  description: string;
  rating: number;
  stock: number;
  badge?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  trackingCode: string;
  invoiceFile: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  isRawHtml?: boolean;
}

export interface VulnerabilityTestCase {
  id: string;
  title: string;
  category: 'SAST' | 'SCA' | 'SECRETS' | 'AUTOSHIP';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cwe: string;
  scannerType: 'Code (SAST)' | 'Dependency (SCA)' | 'Secret Detection' | 'AutoShip Rules';
  description: string;
  impact: string;
  vulnerableSnippet: string;
  autoFixSnippet: string;
  autoFixExplanation: string;
  endpoint?: string;
  method?: 'GET' | 'POST';
  defaultTestValue: string;
  testCases: {
    label: string;
    value: string;
    isMalicious: boolean;
  }[];
}

export interface AutoShipPolicy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  criteria: {
    requireGreenCI: boolean;
    maxSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
    semverType: 'patch' | 'minor' | 'all';
    requireAiAutoFixHighConfidence: boolean;
    autoMergeBranch: string;
  };
  samplePR: {
    prNumber: number;
    title: string;
    branch: string;
    diffSnippet: string;
    ciStatus: 'passed' | 'running' | 'failed';
    confidenceScore: number;
    status: 'Merged Automatically' | 'Pending Review' | 'Blocked by Policy';
  };
}
