import { Reflector } from '@nestjs/core';

import { REQUIRES_TENANT_PERMISSION_KEY } from '../../domain/constants/requires-tenant-permission.constant';
import { RequiresTenantPermission } from './requires-tenant-permission.decorator';

enum TestPermission {
  DELETE_PLANT = 'DELETE_PLANT',
}

describe('RequiresTenantPermission', () => {
  it('sets the required-permission metadata on a method', () => {
    class TestController {
      @RequiresTenantPermission(TestPermission.DELETE_PLANT)
      handler(): void {}
    }

    const reflector = new Reflector();
    const value = reflector.get(
      REQUIRES_TENANT_PERMISSION_KEY,
      new TestController().handler,
    );

    expect(value).toBe(TestPermission.DELETE_PLANT);
  });

  it('sets the required-permission metadata on a class', () => {
    @RequiresTenantPermission(TestPermission.DELETE_PLANT)
    class TestController {}

    const reflector = new Reflector();
    const value = reflector.get(REQUIRES_TENANT_PERMISSION_KEY, TestController);

    expect(value).toBe(TestPermission.DELETE_PLANT);
  });
});
