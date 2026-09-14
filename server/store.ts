import { Product, Order, Review } from '../src/types';
import { handleCryptoRngTest } from './vulnerabilities';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aikido Guard Pro Appliance',
    category: 'Security Software',
    price: 349,
    description: 'Automated code vulnerability scanning, DAST engine, and policy-driven auto-remediation agent.',
    rating: 4.9,
    stock: 24,
    badge: 'Best Seller'
  },
  {
    id: 'prod-2',
    name: 'Hardware FIDO2 Security Dongle',
    category: 'Developer Hardware',
    price: 65,
    description: 'Tamper-resistant physical security key with NFC and USB-C for MFA and SSH signing.',
    rating: 4.8,
    stock: 58,
    badge: 'Hardware'
  },
  {
    id: 'prod-3',
    name: 'Continuous CI AutoShip Pipeline Pack',
    category: 'CI/CD Tools',
    price: 199,
    description: 'GitHub Actions & GitLab pipeline module to auto-merge low-risk non-breaking dependency updates.',
    rating: 5.0,
    stock: 999,
    badge: 'Automated'
  },
  {
    id: 'prod-4',
    name: 'Cloud Infrastructure Penetration Audit',
    category: 'Audit Services',
    price: 850,
    description: 'Comprehensive static and runtime penetration assessment with automated compliance reporting.',
    rating: 4.7,
    stock: 12
  },
  {
    id: 'prod-5',
    name: 'Secrets Zero-Leakage Pre-Commit Hook',
    category: 'Security Software',
    price: 49,
    description: 'Client-side Git hook scanner preventing accidental commits of API keys, tokens, and SSH keys.',
    rating: 4.9,
    stock: 450
  },
  {
    id: 'prod-6',
    name: 'Developer Security Fundamentals Kit',
    category: 'Developer Hardware',
    price: 89,
    description: 'Educational reference deck, secure code cheat-sheets, and interactive vulnerability exercise set.',
    rating: 4.6,
    stock: 35
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-78A9B12C',
    date: '2026-09-12',
    customerName: 'Alex Rivera',
    customerEmail: 'alex.rivera@devsecops.io',
    items: [
      { productId: 'prod-1', name: 'Aikido Guard Pro Appliance', price: 349, quantity: 1 },
      { productId: 'prod-3', name: 'Continuous CI AutoShip Pipeline Pack', price: 199, quantity: 1 }
    ],
    total: 548,
    status: 'Delivered',
    trackingCode: 'TRK-9821-SAFE',
    invoiceFile: 'inv-1001.txt'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-33F4C890',
    date: '2026-09-13',
    customerName: 'Samira Chen',
    customerEmail: 'schen@acmeproduction.corp',
    items: [
      { productId: 'prod-2', name: 'Hardware FIDO2 Security Dongle', price: 65, quantity: 2 },
      { productId: 'prod-5', name: 'Secrets Zero-Leakage Pre-Commit Hook', price: 49, quantity: 1 }
    ],
    total: 179,
    status: 'Shipped',
    trackingCode: 'TRK-4412-EXP',
    invoiceFile: 'inv-1002.txt'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-12E55A7B',
    date: '2026-09-14',
    customerName: 'Jordan Taylor',
    customerEmail: 'jordan.t@fintechcloud.net',
    items: [
      { productId: 'prod-4', name: 'Cloud Infrastructure Penetration Audit', price: 850, quantity: 1 }
    ],
    total: 850,
    status: 'Processing',
    trackingCode: 'TRK-Pending',
    invoiceFile: 'inv-1003.txt'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Elena Rostova',
    role: 'Staff Security Engineer',
    rating: 5,
    date: '2026-09-10',
    comment: 'Aikido AutoShip merged 14 dependency updates this sprint with zero regressions. The CI test integration is phenomenal.'
  },
  {
    id: 'rev-2',
    author: 'Marcus Vance',
    role: 'DevOps Architect',
    rating: 5,
    date: '2026-09-11',
    comment: 'AutoFix caught an unsafe path join in our export service and provided an immediate PR with boundary checks. Highly recommended.'
  },
  {
    id: 'rev-3',
    author: 'PenTester QA',
    role: 'Security Researcher',
    rating: 4,
    date: '2026-09-13',
    comment: 'Testing XSS payloads: <span class="text-amber-600 font-mono bg-amber-50 px-1 rounded">&lt;img src=x onerror=alert(1)&gt;</span> handled safely when sanitized.',
    isRawHtml: true
  }
];

let orders: Order[] = [...INITIAL_ORDERS];
let reviews: Review[] = [...INITIAL_REVIEWS];

export function getStoreProducts(): Product[] {
  return INITIAL_PRODUCTS;
}

export function getStoreOrders(): Order[] {
  return orders;
}

export function createStoreOrder(
  customerName: string,
  customerEmail: string,
  items: { productId: string; quantity: number }[],
  cryptoMode: 'vulnerable' | 'safe' = 'safe'
): Order {
  const productsMap = new Map(INITIAL_PRODUCTS.map(p => [p.id, p]));
  const orderItems = items.map(item => {
    const prod = productsMap.get(item.productId);
    if (!prod) throw new Error(`Product ${item.productId} not found`);
    return {
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: item.quantity
    };
  });

  const total = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const tokenResult = handleCryptoRngTest(cryptoMode);
  const orderNum = tokenResult.token;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    date: new Date().toISOString().split('T')[0],
    customerName,
    customerEmail,
    items: orderItems,
    total,
    status: 'Processing',
    trackingCode: `TRK-${tokenResult.token.slice(-6)}`,
    invoiceFile: 'inv-1001.txt'
  };

  orders.unshift(newOrder);
  return newOrder;
}

export function getStoreReviews(): Review[] {
  return reviews;
}

export function addStoreReview(author: string, role: string, rating: number, comment: string): Review {
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    author: author.trim() || 'Anonymous Developer',
    role: role.trim() || 'Software Engineer',
    rating,
    date: new Date().toISOString().split('T')[0],
    comment: comment.trim()
  };
  reviews.unshift(newReview);
  return newReview;
}
