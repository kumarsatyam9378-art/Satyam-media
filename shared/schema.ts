import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// === USERS ===
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(), // Acts as username for login
  role: text("role", { enum: ["customer", "barber"] }).notNull(),
  location: text("location"), // Optional for customers
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
// === SALONS ===
export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  isOpen: boolean("is_open").default(false),
  isOnBreak: boolean("is_on_break").default(false),
  breakStartTime: timestamp("break_start_time"),
  // We track the current serving token and the last issued token
  currentToken: integer("current_token").default(0),
  lastIssuedToken: integer("last_issued_token").default(0), 
  lastTokenReset: date("last_token_reset").defaultNow(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export const salonsRelations = relations(salons, ({ one, many }) => ({
  owner: one(users, {
    fields: [salons.ownerId],
    references: [users.id],
  }),
  services: many(services),
  queue: many(queueEntries),
}));
export const insertSalonSchema = createInsertSchema(salons).omit({ 
  id: true, 
  currentToken: true, 
  lastIssuedToken: true,
  lastTokenReset: true,
  breakStartTime: true
});
export type Salon = typeof salons.$inferSelect;
export type InsertSalon = z.infer<typeof insertSalonSchema>;
// === SERVICES ===
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  name: text("name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  price: integer("price").notNull(),
});
export const servicesRelations = relations(services, ({ one }) => ({
  salon: one(salons, {
    fields: [services.salonId],
    references: [salons.id],
  }),
}));
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
// === QUEUE ENTRIES ===
export const queueEntries = pgTable("queue_entries", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  tokenNumber: integer("token_number").notNull(),
  status: text("status", { enum: ["waiting", "completed", "cancelled"] }).default("waiting"),
  createdAt: timestamp("created_at").defaultNow(),
  // Snapshot of calculated time when booking (optional, mostly dynamic)
  estimatedWaitMinutes: integer("estimated_wait_minutes"), 
});
export const queueEntriesRelations = relations(queueEntries, ({ one }) => ({
  salon: one(salons, {
    fields: [queueEntries.salonId],
    references: [salons.id],
  }),
  customer: one(users, {
    fields: [queueEntries.customerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [queueEntries.serviceId],
    references: [services.id],
  }),
}));
export const insertQueueEntrySchema = createInsertSchema(queueEntries).omit({ 
  id: true, 
  tokenNumber: true, // Server assigns this
  status: true,
  createdAt: true,
  estimatedWaitMinutes: true
});
export type QueueEntry = typeof queueEntries.$inferSelect;
export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;
// === SUBSCRIPTIONS ===
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type", { enum: ["customer_basic", "customer_advance", "barber_monthly", "barber_yearly"] }).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, startDate: true, isActive: true });
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
// === TYPES FOR API ===
export type LoginRequest = { phone: string; otp: string };
export type CreateServiceRequest = InsertService;
export type JoinQueueRequest = { salonId: number; serviceId: number; customerId: number };
export type SalonWithDetails = Salon & {
  services: Service[];
  queueLength: number;
  estimatedWaitTime: number; // For the NEXT customer
};
export type QueueItemDetail = QueueEntry & {
  service: Service;
  customer: User;
  position: number;
  estimatedStartTime: string; // ISO string calculated on fetch
};
