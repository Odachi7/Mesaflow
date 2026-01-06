import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const clsService = ClsServiceManager.getClsService();
    const tenantId = clsService.get('tenantId');

    if (!tenantId) {
      throw new Error('Tenant ID not found in context');
    }

    return tenantId as string;
  },
);
