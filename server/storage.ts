
import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
// modify the interface with any CRUD methods
// you might need
import { db } from "./db";
import { 
  users, salons, services, queueEntries, subscriptions,
  type User, type InsertUser, 
  type Salon, type InsertSalon,
  type Service, type InsertService,
  type QueueEntry, type InsertQueueEntry,
  type Subscription, type InsertSubscription
} from "@shared/schema";
import { eq, and, gt, desc, asc, sql } from "drizzle-orm";
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  // User
  createUser(user: InsertUser): Promise<User>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  // Salon
  createSalon(salon: InsertSalon): Promise<Salon>;
  getSalonByOwner(ownerId: number): Promise<Salon | undefined>;
  getSalon(id: number): Promise<Salon | undefined>;
  searchSalons(query?: string): Promise<Salon[]>;
  updateSalonStatus(id: number, status: Partial<Salon>): Promise<Salon>;
  resetSalonTokens(id: number): Promise<void>;
  // Services
  createService(service: InsertService): Promise<Service>;
  getSalonServices(salonId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  // Queue
  addToQueue(entry: InsertQueueEntry): Promise<QueueEntry>;
  getSalonQueue(salonId: number): Promise<(QueueEntry & { customer: User; service: Service })[]>;
  getCustomerActiveQueueEntries(customerId: number): Promise<(QueueEntry & { salon: Salon; service: Service })[]>;
  updateQueueStatus(id: number, status: "completed" | "cancelled"): Promise<QueueEntry>;
  getNextInQueue(salonId: number): Promise<QueueEntry | undefined>;
  getQueueEntry(id: number): Promise<QueueEntry | undefined>;
  
  // Subscription
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
}
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  constructor() {
    this.users = new Map();
export class DatabaseStorage implements IStorage {
  // User Operations
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  // Salon Operations
  async createSalon(salon: InsertSalon): Promise<Salon> {
    const [newSalon] = await db.insert(salons).values(salon).returning();
    return newSalon;
  }
  async getSalonByOwner(ownerId: number): Promise<Salon | undefined> {
    const [salon] = await db.select().from(salons).where(eq(salons.ownerId, ownerId));
    return salon;
  }
  async getSalon(id: number): Promise<Salon | undefined> {
    const [salon] = await db.select().from(salons).where(eq(salons.id, id));
    return salon;
  }
  async searchSalons(query?: string): Promise<Salon[]> {
    if (!query) {
      return await db.select().from(salons);
    }
    return await db.select().from(salons).where(sql`${salons.name} ILIKE ${`%${query}%`}`);
  }
  async updateSalonStatus(id: number, status: Partial<Salon>): Promise<Salon> {
    const [updated] = await db.update(salons).set(status).where(eq(salons.id, id)).returning();
    return updated;
  }
  async resetSalonTokens(id: number): Promise<void> {
    await db.update(salons)
      .set({ currentToken: 0, lastIssuedToken: 0, lastTokenReset: sql`CURRENT_DATE` })
      .where(eq(salons.id, id));
  }
  // Services Operations
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }
  async getSalonServices(salonId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.salonId, salonId));
  }
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  // Queue Operations
  async addToQueue(entry: InsertQueueEntry): Promise<QueueEntry> {
    const [newEntry] = await db.insert(queueEntries).values(entry).returning();
    return newEntry;
  }
  async getSalonQueue(salonId: number): Promise<(QueueEntry & { customer: User; service: Service })[]> {
    return await db.query.queueEntries.findMany({
      where: and(
        eq(queueEntries.salonId, salonId),
        eq(queueEntries.status, "waiting")
      ),
      with: {
        customer: true,
        service: true,
      },
      orderBy: [asc(queueEntries.tokenNumber)]
    });
  }
  async getCustomerActiveQueueEntries(customerId: number): Promise<(QueueEntry & { salon: Salon; service: Service })[]> {
    return await db.query.queueEntries.findMany({
      where: and(
        eq(queueEntries.customerId, customerId),
        eq(queueEntries.status, "waiting")
      ),
      with: {
        salon: true,
        service: true
      }
    });
  }
  async updateQueueStatus(id: number, status: "completed" | "cancelled"): Promise<QueueEntry> {
    const [updated] = await db.update(queueEntries)
      .set({ status })
      .where(eq(queueEntries.id, id))
      .returning();
    return updated;
  }
  async getNextInQueue(salonId: number): Promise<QueueEntry | undefined> {
    const [next] = await db.select()
      .from(queueEntries)
      .where(and(eq(queueEntries.salonId, salonId), eq(queueEntries.status, "waiting")))
      .orderBy(asc(queueEntries.tokenNumber))
      .limit(1);
    return next;
  }
  
  async getQueueEntry(id: number): Promise<QueueEntry | undefined> {
    const [entry] = await db.select().from(queueEntries).where(eq(queueEntries.id, id));
    return entry;
  }
  // Subscription Operations
  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values(sub).returning();
    return newSub;
  }
}
export const storage = new MemStorage();
export const storage = new DatabaseStorage();
