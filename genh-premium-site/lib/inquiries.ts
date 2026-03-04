import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

import type { InquiryInput, InquiryRecord, InquiryUpdateInput } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");
const REDIS_KEY = "genh:inquiries";

type StorageMode = "vercel-kv" | "local-dev" | "unconfigured";

function getRedisClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function normalizeRecord(record: InquiryRecord): InquiryRecord {
  return {
    ...record,
    status: record.status ?? "new",
    notes: record.notes ?? ""
  };
}

export function getStorageMode(): StorageMode {
  if (getRedisClient()) {
    return "vercel-kv";
  }

  if (process.env.VERCEL) {
    return "unconfigured";
  }

  return "local-dev";
}

async function ensureLocalStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readLocalInquiries(): Promise<InquiryRecord[]> {
  await ensureLocalStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as InquiryRecord[];
  return parsed.map(normalizeRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeLocalInquiries(records: InquiryRecord[]) {
  await ensureLocalStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

async function readRedisInquiries(client: Redis): Promise<InquiryRecord[]> {
  const values = (await client.lrange<InquiryRecord>(REDIS_KEY, 0, 199)) ?? [];
  return values.map(normalizeRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeRedisInquiries(client: Redis, records: InquiryRecord[]) {
  await client.del(REDIS_KEY);

  if (records.length === 0) {
    return;
  }

  await client.rpush(
    REDIS_KEY,
    ...records.map((record) => JSON.parse(JSON.stringify(record)))
  );
}

export async function listInquiries(limit = 6): Promise<InquiryRecord[]> {
  const client = getRedisClient();

  if (client) {
    return (await readRedisInquiries(client)).slice(0, limit);
  }

  if (getStorageMode() === "unconfigured") {
    return [];
  }

  return (await readLocalInquiries()).slice(0, limit);
}

export async function createInquiry(payload: InquiryInput): Promise<InquiryRecord> {
  const record: InquiryRecord = {
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
    notes: "",
    ...payload
  };

  const client = getRedisClient();

  if (client) {
    await client.lpush(REDIS_KEY, record);
    await client.ltrim(REDIS_KEY, 0, 199);
    return record;
  }

  if (getStorageMode() === "unconfigured") {
    throw new Error("Production storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN before deploying.");
  }

  const current = await readLocalInquiries();
  current.unshift(record);
  await writeLocalInquiries(current.slice(0, 200));
  return record;
}

export async function getInquiryDashboard() {
  const records = await listInquiries(6);
  const storage = getStorageMode();

  return {
    storage,
    totalTracked: records.length,
    thisWeek: records.filter((record) => {
      const age = Date.now() - new Date(record.createdAt).getTime();
      return age <= 7 * 24 * 60 * 60 * 1000;
    }).length,
    latest: records
  };
}

export async function updateInquiry(id: string, payload: InquiryUpdateInput): Promise<InquiryRecord | null> {
  const client = getRedisClient();

  if (client) {
    const current = await readRedisInquiries(client);
    const index = current.findIndex((record) => record.id === id);

    if (index === -1) {
      return null;
    }

    const updated = {
      ...current[index],
      status: payload.status,
      notes: payload.notes
    };

    current[index] = updated;
    await writeRedisInquiries(client, current);
    return updated;
  }

  if (getStorageMode() === "unconfigured") {
    return null;
  }

  const current = await readLocalInquiries();
  const index = current.findIndex((record) => record.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...current[index],
    status: payload.status,
    notes: payload.notes
  };

  current[index] = updated;
  await writeLocalInquiries(current);
  return updated;
}
