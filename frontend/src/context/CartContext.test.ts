import { describe, it, expect } from 'vitest';
import { cartReducer, CartItem } from '../context/CartContext';

const item1: CartItem = { id: 'p1', name: 'Focus Shot', price: 29.99, quantity: 1 };
const item2: CartItem = { id: 'p2', name: 'Zen Drop', price: 19.99, quantity: 2 };
const empty = { items: [] };

describe('cartReducer', () => {
  // ── ADD ──────────────────────────────────────────────────────────────────
  describe('ADD', () => {
    it('adds a new item to an empty cart', () => {
      const state = cartReducer(empty, { type: 'ADD', payload: item1 });
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(item1);
    });

    it('increases quantity when adding an existing item', () => {
      const withItem = { items: [item1] };
      const state = cartReducer(withItem, {
        type: 'ADD',
        payload: { ...item1, quantity: 3 },
      });
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(4); // 1 + 3
    });

    it('keeps other items untouched when adding a new one', () => {
      const withItem = { items: [item1] };
      const state = cartReducer(withItem, { type: 'ADD', payload: item2 });
      expect(state.items).toHaveLength(2);
      expect(state.items.find((i) => i.id === 'p1')).toEqual(item1);
    });
  });

  // ── REMOVE ──────────────────────────────────────────────────────────────
  describe('REMOVE', () => {
    it('removes the specified item', () => {
      const state = cartReducer(
        { items: [item1, item2] },
        { type: 'REMOVE', payload: { id: 'p1' } },
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('p2');
    });

    it('returns same items if id not found', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'REMOVE', payload: { id: 'nonexistent' } },
      );
      expect(state.items).toHaveLength(1);
    });
  });

  // ── UPDATE_QUANTITY ──────────────────────────────────────────────────────
  describe('UPDATE_QUANTITY', () => {
    it('updates quantity of an item', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'UPDATE_QUANTITY', payload: { id: 'p1', quantity: 5 } },
      );
      expect(state.items[0].quantity).toBe(5);
    });

    it('removes item when quantity set to 0', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'UPDATE_QUANTITY', payload: { id: 'p1', quantity: 0 } },
      );
      expect(state.items).toHaveLength(0);
    });

    it('removes item when quantity is negative', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'UPDATE_QUANTITY', payload: { id: 'p1', quantity: -1 } },
      );
      expect(state.items).toHaveLength(0);
    });
  });

  // ── CLEAR ────────────────────────────────────────────────────────────────
  describe('CLEAR', () => {
    it('empties the cart', () => {
      const state = cartReducer({ items: [item1, item2] }, { type: 'CLEAR' });
      expect(state.items).toHaveLength(0);
    });

    it('is idempotent on an already empty cart', () => {
      const state = cartReducer(empty, { type: 'CLEAR' });
      expect(state.items).toHaveLength(0);
    });
  });

  // ── HYDRATE ──────────────────────────────────────────────────────────────
  describe('HYDRATE', () => {
    it('replaces current state with payload', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'HYDRATE', payload: [item2] },
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('p2');
    });
  });

  // ── MERGE ────────────────────────────────────────────────────────────────
  describe('MERGE', () => {
    it('adds new items from the incoming cart', () => {
      const state = cartReducer(
        { items: [item1] },
        { type: 'MERGE', payload: [item2] },
      );
      expect(state.items).toHaveLength(2);
    });

    it('sums quantities for duplicate items', () => {
      const state = cartReducer(
        { items: [{ ...item1, quantity: 2 }] },
        { type: 'MERGE', payload: [{ ...item1, quantity: 3 }] },
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5); // 2 + 3
    });

    it('does not mutate state with an empty incoming cart', () => {
      const state = cartReducer({ items: [item1] }, { type: 'MERGE', payload: [] });
      expect(state.items).toHaveLength(1);
    });
  });

  // ── Derived values (totalItems / totalPrice) ──────────────────────────────
  describe('derived values', () => {
    it('calculates totalItems correctly after multiple adds', () => {
      let state = cartReducer(empty, { type: 'ADD', payload: item1 });
      state = cartReducer(state, { type: 'ADD', payload: item2 });
      const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
      expect(totalItems).toBe(3); // 1 + 2
    });

    it('calculates totalPrice correctly', () => {
      let state = cartReducer(empty, { type: 'ADD', payload: item1 }); // 29.99 * 1
      state = cartReducer(state, { type: 'ADD', payload: item2 });     // 19.99 * 2
      const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
      expect(totalPrice).toBeCloseTo(69.97);
    });
  });
});
