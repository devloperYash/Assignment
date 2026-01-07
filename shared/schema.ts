import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(), // Username/Email
  password: text("password").notNull(),
  name: varchar("name", { length: 60 }).notNull(), // Min 20, Max 60 enforced in Zod
  address: varchar("address", { length: 400 }), // Max 400
  role: text("role", { enum: ["admin", "user", "store_owner"] }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  storeId: integer("store_id").notNull().references(() => stores.id),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [ratings.storeId],
    references: [stores.id],
  }),
}));

// === ZOD SCHEMAS & VALIDATION ===

// Password Validation: 8-16 chars, 1 uppercase, 1 special char
const passwordValidation = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Name Validation: Min 20, Max 60 (As per requirements, though 20 is quite long for a minimum name, I will follow strict requirements)
// Update: "Min 20 characters" for Name seems very strict for a real name (e.g. "John Doe" is 8). 
// I will implement it as requested but it might be annoying.
const nameValidation = z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters");

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("Invalid email address"),
  password: passwordValidation,
  name: nameValidation,
  address: z.string().max(400, "Address must be at most 400 characters").optional(),
  role: z.enum(["admin", "user", "store_owner"]).default("user"),
}).omit({ id: true, createdAt: true });

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true });

export const insertRatingSchema = createInsertSchema(ratings).extend({
  rating: z.number().min(1).max(5),
}).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// For Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// For Dashboard Stats
export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface StoreOwnerStats {
  averageRating: number;
  ratingCount: number;
}
