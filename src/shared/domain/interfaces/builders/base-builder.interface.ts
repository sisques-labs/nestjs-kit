/**
 * Base interface for domain builders that construct aggregates and view models.
 *
 * Implementations should validate required state before building.
 */
export interface IBuilder<TAggregate, TViewModel> {
  /**
   * Validates that all required fields are set before building.
   */
  validate(): void;

  /**
   * Builds the domain aggregate from the configured state.
   */
  build(): TAggregate;

  /**
   * Builds the read-side view model from the configured state.
   */
  buildViewModel(): TViewModel;
}
