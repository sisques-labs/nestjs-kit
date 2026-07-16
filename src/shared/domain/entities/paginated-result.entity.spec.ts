import { PaginatedResult } from '@/shared/domain/entities/paginated-result.entity';

describe('PaginatedResult', () => {
  it('exposes items, total, page and perPage from the constructor', () => {
    const items = [1, 2, 3];
    const result = new PaginatedResult(items, 30, 2, 3);

    expect(result.items).toBe(items);
    expect(result.total).toBe(30);
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(3);
  });

  it('totalPages divides evenly', () => {
    const result = new PaginatedResult([], 100, 1, 10);

    expect(result.totalPages).toBe(10);
  });

  it('totalPages rounds up for a non-even division', () => {
    const result = new PaginatedResult([], 95, 1, 10);

    expect(result.totalPages).toBe(10);
  });

  it('totalPages is 0 when there are no items', () => {
    const result = new PaginatedResult([], 0, 1, 10);

    expect(result.totalPages).toBe(0);
  });
});
