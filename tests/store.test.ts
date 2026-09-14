import { describe, it, expect } from 'vitest';
import { getStoreProducts, getStoreOrders, createStoreOrder, addStoreReview, getStoreReviews } from '../server/store';

describe('E-Commerce Store & Order Hub', () => {
  it('should return initial product catalog with valid pricing and stock', () => {
    const products = getStoreProducts();
    expect(products.length).toBeGreaterThanOrEqual(4);
    products.forEach(product => {
      expect(product.price).toBeGreaterThan(0);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.name).toBeTruthy();
    });
  });

  it('should create an order with calculated total and tracking ID', () => {
    const order = createStoreOrder(
      'Jordan QA Engineer',
      'jordan.qa@testlab.internal',
      [{ productId: 'prod-1', quantity: 2 }],
      'safe'
    );

    expect(order.customerName).toBe('Jordan QA Engineer');
    expect(order.items.length).toBe(1);
    expect(order.total).toBe(349 * 2);
    expect(order.orderNumber).toMatch(/^ORD-[A-F0-9]+/);
    expect(order.trackingCode).toBeTruthy();
  });

  it('should add customer reviews and maintain list integrity', () => {
    const initialCount = getStoreReviews().length;
    const newReview = addStoreReview(
      'Security Lead',
      'AppSec',
      5,
      'AutoShip successfully merged dependency upgrades.'
    );

    expect(newReview.author).toBe('Security Lead');
    expect(getStoreReviews().length).toBe(initialCount + 1);
  });
});
