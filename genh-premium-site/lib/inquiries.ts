import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

import type { InquiryInput, InquiryRecord } from "@/lib/types";

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
  return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeLocalInquiries(records: InquiryRecord[]) {
  await ensureLocalStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

async function readRedisInquiries(client: Redis): Promise<InquiryRecord[]> {
  const values = (await client.lrange<InquiryRecord>(REDIS_KEY, 0, 199)) ?? [];
  return values.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
