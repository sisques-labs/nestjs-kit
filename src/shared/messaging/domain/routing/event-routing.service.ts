import { Inject, Injectable } from '@nestjs/common';

import {
  AGGREGATE_MODULE_MAP,
  UNMAPPED_MODULE,
} from '../constants/messaging.constants';

export interface IResolvedModule {
  module: string;
  /** True when the aggregate root type had no explicit mapping (fell back to `unmapped`). */
  fallback: boolean;
}

/**
 * Resolves the bounded-context module for an aggregate root type, using the
 * app-supplied map (see `MessagingModule.forRoot({ aggregateModuleMap })`).
 */
@Injectable()
export class EventRoutingService {
  constructor(
    @Inject(AGGREGATE_MODULE_MAP)
    private readonly aggregateModuleMap: Readonly<Record<string, string>>,
  ) {}

  resolveModule(aggregateRootType: string): IResolvedModule {
    const module = this.aggregateModuleMap[aggregateRootType];
    return module
      ? { module, fallback: false }
      : { module: UNMAPPED_MODULE, fallback: true };
  }
}

/**
 * Derives a kebab-cased action from an event class name, dropping the trailing
 * `Event` suffix. `PlantCreatedEvent` -> `plant-created`,
 * `PlantNameChangedEvent` -> `plant-name-changed`.
 *
 * Pure function — no app-specific state, so it stays a free function rather
 * than a DI service.
 */
export function deriveAction(eventType: string): string {
  return eventType
    .replace(/Event$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
