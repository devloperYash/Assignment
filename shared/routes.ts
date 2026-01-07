import { z } from 'zod';
import { insertUserSchema, insertStoreSchema, insertRatingSchema, loginSchema, users, stores, ratings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns the logged in user
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    changePassword: {
      method: 'POST' as const,
      path: '/api/user/password',
      input: z.object({
        currentPassword: z.string(),
        newPassword: z.string(), // Must validate regex on server or client reuse schema
      }),
      responses: {
        200: z.void(),
        400: errorSchemas.validation,
      },
    }
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalStores: z.number(),
          totalRatings: z.number(),
        }),
        403: errorSchemas.forbidden,
      },
    },
    getUsers: {
      method: 'GET' as const,
      path: '/api/admin/users',
      input: z.object({
        search: z.string().optional(),
        role: z.enum(['admin', 'user', 'store_owner']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        403: errorSchemas.forbidden,
      },
    },
    createUser: {
      method: 'POST' as const,
      path: '/api/admin/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
      },
    },
  },
  stores: {
    list: {
      method: 'GET' as const,
      path: '/api/stores',
      input: z.object({
        search: z.string().optional(), // Search by Name or Address
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof stores.$inferSelect & { averageRating?: number, myRating?: number }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stores', // Admin only
      input: insertStoreSchema,
      responses: {
        201: z.custom<typeof stores.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stores/:id',
      responses: {
        200: z.custom<typeof stores.$inferSelect & { ratings: any[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  ratings: {
    submit: {
      method: 'POST' as const,
      path: '/api/ratings',
      input: insertRatingSchema,
      responses: {
        201: z.custom<typeof ratings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ratings/:id',
      input: z.object({ rating: z.number().min(1).max(5) }),
      responses: {
        200: z.custom<typeof ratings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listForStore: {
      method: 'GET' as const,
      path: '/api/stores/:id/ratings', // For Store Owner
      responses: {
        200: z.array(z.custom<typeof ratings.$inferSelect & { user: typeof users.$inferSelect }>()),
        403: errorSchemas.forbidden,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
