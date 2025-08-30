import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  whatsappNumber: varchar("whatsapp_number").notNull(),
  password: text("password").notNull(),
  referralCode: varchar("referral_code"),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game sessions for tracking player games
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type").notNull(), // 'mines', 'crash', 'plinko', etc.
  betAmount: decimal("bet_amount", { precision: 20, scale: 8 }).notNull(),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).default("0"),
  payout: decimal("payout", { precision: 20, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  gameData: jsonb("game_data"), // Store game-specific data like mine positions
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Transactions for deposits/withdrawals
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win'
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency").notNull(), // 'USDT', 'BTC', 'ETH', etc.
  status: varchar("status").default("pending"), // 'pending', 'completed', 'failed'
  method: varchar("method"), // 'crypto', 'upi'
  address: text("address"), // Wallet address or UPI ID
  txHash: varchar("tx_hash"), // Transaction hash for crypto
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Big wins for the recent wins display
export const bigWins = pgTable("big_wins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type").notNull(),
  betAmount: decimal("bet_amount", { precision: 20, scale: 8 }).notNull(),
  winAmount: decimal("win_amount", { precision: 20, scale: 8 }).notNull(),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertGameSession = typeof gameSessions.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBigWin = typeof bigWins.$inferInsert;
export type BigWin = typeof bigWins.$inferSelect;

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
