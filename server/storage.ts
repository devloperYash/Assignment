import { db } from "./db";
import { users, stores, ratings, type User, type InsertUser, type Store, type InsertStore, type Rating, type InsertRating } from "@shared/schema";
import { eq, like, or, and, sql, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Auth & User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  getAllUsers(params?: { search?: string; role?: string }): Promise<User[]>;
  
  // Store Management
  createStore(store: InsertStore): Promise<Store>;
  getStore(id: number): Promise<Store | undefined>;
  getAllStores(search?: string): Promise<Store[]>;
  
  // Ratings
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, rating: number): Promise<Rating>;
  getRating(id: number): Promise<Rating | undefined>;
  getRatingsForStore(storeId: number): Promise<(Rating & { user: User })[]>;
  getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined>;
  
  // Stats
  getSystemStats(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }>;
  getStoreStats(storeId: number): Promise<{ averageRating: number; ratingCount: number }>;
  getStoreAverageRating(storeId: number): Promise<number>;
  
  // Session
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async getAllUsers(params?: { search?: string; role?: string }): Promise<User[]> {
    let query = db.select().from(users);
    const filters = [];
    
    if (params?.search) {
      const searchLower = `%${params.search.toLowerCase()}%`;
      filters.push(or(
        like(sql`lower(${users.name})`, searchLower),
        like(sql`lower(${users.email})`, searchLower),
        like(sql`lower(${users.address})`, searchLower)
      ));
    }
    
    if (params?.role) {
      // Cast to the enum type to satisfy Drizzle
      filters.push(eq(users.role, params.role as "admin" | "user" | "store_owner"));
    }
    
    if (filters.length > 0) {
      // @ts-ignore - spread arguments
      query = query.where(and(...filters));
    }
    
    return await query;
  }

  // Stores
  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async getAllStores(search?: string): Promise<Store[]> {
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      return await db.select().from(stores).where(or(
        like(sql`lower(${stores.name})`, searchLower),
        like(sql`lower(${stores.address})`, searchLower)
      ));
    }
    return await db.select().from(stores);
  }

  // Ratings
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async updateRating(id: number, ratingVal: number): Promise<Rating> {
    const [updatedRating] = await db.update(ratings)
      .set({ rating: ratingVal })
      .where(eq(ratings.id, id))
      .returning();
    return updatedRating;
  }
  
  async getRating(id: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async getRatingsForStore(storeId: number): Promise<(Rating & { user: User })[]> {
    const result = await db.select({
      rating: ratings,
      user: users
    })
    .from(ratings)
    .innerJoin(users, eq(ratings.userId, users.id))
    .where(eq(ratings.storeId, storeId))
    .orderBy(desc(ratings.createdAt));
    
    return result.map(r => ({ ...r.rating, user: r.user }));
  }
  
  async getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(and(
      eq(ratings.userId, userId),
      eq(ratings.storeId, storeId)
    ));
    return rating;
  }

  // Stats
  async getSystemStats(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [storeCount] = await db.select({ count: sql<number>`count(*)` }).from(stores);
    const [ratingCount] = await db.select({ count: sql<number>`count(*)` }).from(ratings);
    
    return {
      totalUsers: Number(userCount.count),
      totalStores: Number(storeCount.count),
      totalRatings: Number(ratingCount.count),
    };
  }
  
  async getStoreStats(storeId: number): Promise<{ averageRating: number; ratingCount: number }> {
    const [stats] = await db.select({
      avg: sql<number>`avg(${ratings.rating})`,
      count: sql<number>`count(*)`
    })
    .from(ratings)
    .where(eq(ratings.storeId, storeId));
    
    return {
      averageRating: stats ? Number(stats.avg || 0) : 0,
      ratingCount: stats ? Number(stats.count || 0) : 0,
    };
  }

  async getStoreAverageRating(storeId: number): Promise<number> {
    const stats = await this.getStoreStats(storeId);
    return stats.averageRating;
  }
}

export const storage = new DatabaseStorage();
