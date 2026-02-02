import { z } from "zod";
import { 
  insertUserSchema, 
  insertSalonSchema, 
  insertServiceSchema, 
  users, 
  salons, 
  services, 
  queueEntries,
  subscriptions
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        phone: z.string(),
        otp: z.string() // Mock OTP for now
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns user
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      }
    }
  },
  salons: {
    create: {
      method: 'POST' as const,
      path: '/api/salons',
      input: insertSalonSchema,
      responses: {
        201: z.custom<typeof salons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getMySalon: { // For owner
      method: 'GET' as const,
      path: '/api/salons/me',
      responses: {
        200: z.custom<typeof salons.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    search: {
      method: 'GET' as const,
      path: '/api/salons/search',
      input: z.object({
        query: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof salons.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/salons/:id',
      responses: {
        200: z.custom<typeof salons.$inferSelect & { services: typeof services.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/salons/:id/status',
      input: z.object({
        isOpen: z.boolean().optional(),
        isOnBreak: z.boolean().optional(),
        action: z.enum(['open', 'close', 'break_start', 'break_end']).optional(),
      }),
      responses: {
        200: z.custom<typeof salons.$inferSelect>(),
      },
    },
    getQueueStatus: {
      method: 'GET' as const,
      path: '/api/salons/:id/queue-status',
      responses: {
        200: z.object({
          currentToken: z.number(),
          lastIssuedToken: z.number(),
          queueLength: z.number(),
          totalWaitTimeMinutes: z.number(),
        })
      }
    }
  },
  services: {
    create: {
      method: 'POST' as const,
      path: '/api/salons/:salonId/services',
      input: insertServiceSchema.omit({ salonId: true }),
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/salons/:salonId/services',
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      }
    }
  },
  queue: {
    join: {
      method: 'POST' as const,
      path: '/api/queue/join',
      input: z.object({
        salonId: z.number(),
        serviceId: z.number(),
        customerId: z.number(),
      }),
      responses: {
        201: z.custom<typeof queueEntries.$inferSelect & { estimatedWaitMinutes: number, position: number }>(),
        400: errorSchemas.validation,
      }
    },
    list: { // For owner to see list
      method: 'GET' as const,
      path: '/api/salons/:salonId/queue',
      responses: {
        200: z.array(z.custom<typeof queueEntries.$inferSelect & { 
          customer: typeof users.$inferSelect,
          service: typeof services.$inferSelect 
        }>()),
      }
    },
    myQueue: { // For customer to see their active tokens
      method: 'GET' as const,
      path: '/api/queue/me',
      responses: {
        200: z.array(z.custom<typeof queueEntries.$inferSelect & { 
          salon: typeof salons.$inferSelect,
          service: typeof services.$inferSelect,
          position: number,
          estimatedWaitMinutes: number
        }>()),
      }
    },
    update: { // Next customer, cancel, etc.
      method: 'PATCH' as const,
      path: '/api/queue/:id',
      input: z.object({
        status: z.enum(['completed', 'cancelled']),
      }),
      responses: {
        200: z.custom<typeof queueEntries.$inferSelect>(),
      }
    },
    next: { // Special endpoint for owner to call "Next"
      method: 'POST' as const,
      path: '/api/salons/:salonId/queue/next',
      responses: {
        200: z.object({ message: z.string(), nextToken: z.number().nullable() }),
      }
    }
  },
  subscriptions: {
    subscribe: {
      method: 'POST' as const,
      path: '/api/subscriptions',
      input: z.object({
        userId: z.number(),
        type: z.enum(["customer_basic", "customer_advance", "barber_monthly", "barber_yearly"]),
      }),
      responses: {
        201: z.custom<typeof subscriptions.$inferSelect>(),
      }
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
