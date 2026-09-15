import "server-only";
import type { User } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_USERS } from "./seed";

const users = createCollection<User>("users", SEED_USERS);

export async function listUsers(): Promise<User[]> {
  return users.list();
}

export async function getUserById(id: string): Promise<User | null> {
  return users.get(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(user: User): Promise<User> {
  return users.insert(user);
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | null> {
  return users.update(id, patch);
}
