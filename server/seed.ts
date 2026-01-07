import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await storage.getAllUsers();
  if (existingUsers.length === 0) {
    console.log("Creating users...");
    const adminPassword = await hashPassword("Admin123!");
    await storage.createUser({
      email: "admin@system.com",
      password: adminPassword,
      name: "System Administrator",
      address: "Admin HQ",
      role: "admin",
    });

    const ownerPassword = await hashPassword("Owner123!");
    await storage.createUser({
      email: "owner@store.com",
      password: ownerPassword,
      name: "John Storeowner",
      address: "123 Market St",
      role: "store_owner",
    });

    const userPassword = await hashPassword("User123!");
    await storage.createUser({
      email: "user@normal.com",
      password: userPassword,
      name: "Alice Normaluser",
      address: "456 Resident Ave",
      role: "user",
    });
  }

  const existingStores = await storage.getAllStores();
  if (existingStores.length === 0) {
    console.log("Creating stores...");
    await storage.createStore({
      name: "Tech Gadgets Pro",
      address: "101 Silicon Valley",
    });

    await storage.createStore({
      name: "Fresh Foods Market",
      address: "202 Green Way",
    });
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
