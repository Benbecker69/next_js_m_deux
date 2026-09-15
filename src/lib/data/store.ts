import "server-only";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function collectionPath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readCollection<T>(name: string, seed: T[]): Promise<T[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(collectionPath(name), "utf-8");
    return JSON.parse(raw) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeCollection(name, seed);
      return seed;
    }
    throw error;
  }
}

async function writeCollection<T>(name: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(collectionPath(name), JSON.stringify(data, null, 2), "utf-8");
}

/**
 * A JSON-file-backed collection, keyed by `id`. Genuinely persists across
 * reloads/restarts (unlike an in-memory array) without needing a real
 * database yet — see CLAUDE.md "Décisions actées". Not safe for concurrent
 * writes across multiple processes; fine for a single local `next dev`
 * process, which is the only place this runs today. Swappable later for a
 * Prisma/PostgreSQL implementation behind the same method names.
 */
export function createCollection<T extends { id: string }>(name: string, seed: T[]) {
  return {
    async list(): Promise<T[]> {
      return readCollection<T>(name, seed);
    },
    async get(id: string): Promise<T | null> {
      const items = await readCollection<T>(name, seed);
      return items.find((item) => item.id === id) ?? null;
    },
    async find(predicate: (item: T) => boolean): Promise<T | null> {
      const items = await readCollection<T>(name, seed);
      return items.find(predicate) ?? null;
    },
    async filter(predicate: (item: T) => boolean): Promise<T[]> {
      const items = await readCollection<T>(name, seed);
      return items.filter(predicate);
    },
    async insert(item: T): Promise<T> {
      const items = await readCollection<T>(name, seed);
      items.push(item);
      await writeCollection(name, items);
      return item;
    },
    async update(id: string, patch: Partial<T>): Promise<T | null> {
      const items = await readCollection<T>(name, seed);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...patch };
      await writeCollection(name, items);
      return items[index];
    },
    async remove(id: string): Promise<boolean> {
      const items = await readCollection<T>(name, seed);
      const next = items.filter((item) => item.id !== id);
      await writeCollection(name, next);
      return next.length !== items.length;
    },
  };
}
