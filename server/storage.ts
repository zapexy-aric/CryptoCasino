import {
  users,
  gameSessions,
  transactions,
  bigWins,
  type User,
  type UpsertUser,
  type GameSession,
  type InsertGameSession,
  type Transaction,
  type InsertTransaction,
  type BigWin,
  type InsertBigWin,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getActiveGameSession(userId: string, gameType: string): Promise<GameSession | undefined>;
  updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  // Big wins operations
  createBigWin(bigWin: InsertBigWin): Promise<BigWin>;
  getRecentBigWins(): Promise<BigWin[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Game session operations
  async createGameSession(sessionData: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getActiveGameSession(userId: string, gameType: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(and(
        eq(gameSessions.userId, userId),
        eq(gameSessions.gameType, gameType),
        eq(gameSessions.isActive, true)
      ));
    return session;
  }

  async updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.id, sessionId))
      .returning();
    return session;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Big wins operations
  async createBigWin(bigWinData: InsertBigWin): Promise<BigWin> {
    const [bigWin] = await db
      .insert(bigWins)
      .values(bigWinData)
      .returning();
    return bigWin;
  }

  async getRecentBigWins(): Promise<BigWin[]> {
    return await db
      .select()
      .from(bigWins)
      .orderBy(desc(bigWins.createdAt))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
