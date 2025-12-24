import { Elysia } from 'elysia';

export const clientInfoPlugin = new Elysia({
  name: 'client-info',
})
  .resolve(({ request, server, headers }) => {
    const userAgent = headers?.['user-agent'] || 'Unknown';
    const ip = server?.requestIP?.(request);
    const ipAddress = ip?.address || null;
    return { clientInfo: { userAgent, ipAddress } };
  })
  .as('global');
