import { BaseViewModel } from '@/shared/domain/view-models/base-view-model/base-view-model';

class TestViewModel extends BaseViewModel {}

describe('BaseViewModel', () => {
  it('exposes id, createdAt and updatedAt from the constructor', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const viewModel = new TestViewModel('id-1', createdAt, updatedAt);

    expect(viewModel.id).toBe('id-1');
    expect(viewModel.createdAt).toBe(createdAt);
    expect(viewModel.updatedAt).toBe(updatedAt);
  });

  it('allows updatedAt to be reassigned via its setter', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');
    const newUpdatedAt = new Date('2024-01-03T00:00:00.000Z');

    const viewModel = new TestViewModel('id-1', createdAt, updatedAt);
    viewModel.updatedAt = newUpdatedAt;

    expect(viewModel.updatedAt).toBe(newUpdatedAt);
  });
});
