import { promises as fs } from "fs";
import path from "path";
import { get as getBlob, put } from "@vercel/blob";

import type { InquiryInput, InquiryRecord, InquiryUpdateInput } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");
const BLOB_PATHNAME = "genh-premium-site/inquiries.json";

type StorageMode = "vercel-blob" | "local-dev" | "unconfigured";

function hasBlobStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getStorageMode(): StorageMode {
  if (hasBlobStore()) {
    return "vercel-blob";
  }

  if (process.env.VERCEL) {
    return "unconfigured";
  }

  return "local-dev";
}

function normalizeRecord(record: InquiryRecord): InquiryRecord {
  return {
    ...record,
    status: record.status ?? "new",
    notes: record.notes ?? ""
  };
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

async function readBlobInquiries(): Promise<InquiryRecord[]> {
  const blob = await getBlob(BLOB_PATHNAME, { access: "private" });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return [];
  }

  const raw = await new Response(blob.stream).text();
  const parsed = JSON.parse(raw) as InquiryRecord[];
  return parsed.map(normalizeRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeBlobInquiries(records: InquiryRecord[]) {
  await put(BLOB_PATHNAME, JSON.stringify(records, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

async function readAllInquiries(): Promise<InquiryRecord[]> {
  if (hasBlobStore()) {
    return readBlobInquiries();
  }

  if (getStorageMode() === "unconfigured") {
    return [];
  }

  return readLocalInquiries();
}

async function writeAllInquiries(records: InquiryRecord[]) {
  if (hasBlobStore()) {
    await writeBlobInquiries(records);
    return;
  }

  if (getStorageMode() === "unconfigured") {
    throw new Error("Production storage is not configured. Set BLOB_READ_WRITE_TOKEN before deploying.");
  }

  await writeLocalInquiries(records);
}

export async function listInquiries(limit = 6): Promise<InquiryRecord[]> {
  return (await readAllInquiries()).slice(0, limit);
}

export async function createInquiry(payload: InquiryInput): Promise<InquiryRecord> {
  const record: InquiryRecord = {
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
    notes: "",
    ...payload
  };

  if (getStorageMode() === "unconfigured") {
    throw new Error("Production storage is not configured. Set BLOB_READ_WRITE_TOKEN before deploying.");
  }

  const current = await readAllInquiries();
  current.unshift(record);
  await writeAllInquiries(current.slice(0, 200));
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
  if (getStorageMode() === "unconfigured") {
    return null;
  }

  const current = await readAllInquiries();
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
  await writeAllInquiries(current);
  return updated;
}
