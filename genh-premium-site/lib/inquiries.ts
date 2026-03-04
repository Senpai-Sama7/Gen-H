import { promises as fs } from "fs";
import path from "path";
import { del, head, list, put } from "@vercel/blob";

import type { InquiryInput, InquiryRecord, InquiryUpdateInput } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

type StorageMode = "vercel-blob" | "local-dev" | "unconfigured";
export type InquiryListResult = {
  records: InquiryRecord[];
  snapshotPath: string | null;
};

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function hasBlobStore() {
  return Boolean(readEnv("BLOB_READ_WRITE_TOKEN"));
}

function getBlobPathname() {
  return (readEnv("INQUIRY_BLOB_PATH") || "genh-premium-site-inquiries-ledger").replace(/\.json$/i, "");
}

async function getLatestBlobSnapshot() {
  const prefix = `${getBlobPathname()}/`;
  const response = await list({ prefix, limit: 64 });
  const latest = [...response.blobs].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  return {
    latest,
    blobs: response.blobs
  };
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

async function readBlobSnapshot(pathname?: string): Promise<InquiryListResult> {
  let latest;

  try {
    latest = pathname ? await head(pathname) : (await getLatestBlobSnapshot()).latest;
  } catch {
    latest = (await getLatestBlobSnapshot()).latest;
  }

  if (!latest?.downloadUrl) {
    return {
      records: [],
      snapshotPath: null
    };
  }

  const response = await fetch(`${latest.downloadUrl}?ts=${Date.now()}`, { cache: "no-store" });

  if (!response.ok) {
    return {
      records: [],
      snapshotPath: null
    };
  }

  const raw = await response.text();
  const parsed = JSON.parse(raw) as InquiryRecord[];
  return {
    records: parsed.map(normalizeRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    snapshotPath: latest.pathname
  };
}

async function writeBlobInquiries(records: InquiryRecord[]) {
  const prefix = getBlobPathname();
  const uploaded = await put(`${prefix}/${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify(records, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });

  const { blobs } = await getLatestBlobSnapshot();
  const stale = [...blobs]
    .filter((blob) => blob.pathname !== uploaded.pathname)
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(4)
    .map((blob) => blob.pathname);

  if (stale.length > 0) {
    await del(stale);
  }

  return uploaded.pathname;
}

async function readAllInquiries(snapshotPath?: string): Promise<InquiryListResult> {
  if (hasBlobStore()) {
    return readBlobSnapshot(snapshotPath);
  }

  if (getStorageMode() === "unconfigured") {
    return {
      records: [],
      snapshotPath: null
    };
  }

  return {
    records: await readLocalInquiries(),
    snapshotPath: null
  };
}

async function writeAllInquiries(records: InquiryRecord[]) {
  if (hasBlobStore()) {
    return writeBlobInquiries(records);
  }

  if (getStorageMode() === "unconfigured") {
    throw new Error("Production storage is not configured. Set BLOB_READ_WRITE_TOKEN before deploying.");
  }

  await writeLocalInquiries(records);
  return null;
}

export async function listInquiries(limit = 6, snapshotPath?: string): Promise<InquiryRecord[]> {
  return (await readAllInquiries(snapshotPath)).records.slice(0, limit);
}

export async function listInquiriesWithSnapshot(limit = 6, snapshotPath?: string): Promise<InquiryListResult> {
  const result = await readAllInquiries(snapshotPath);

  return {
    records: result.records.slice(0, limit),
    snapshotPath: result.snapshotPath
  };
}

export async function createInquiry(payload: InquiryInput): Promise<{ record: InquiryRecord; snapshotPath: string | null }> {
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
  current.records.unshift(record);
  const snapshotPath = await writeAllInquiries(current.records.slice(0, 200));
  return { record, snapshotPath };
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

export async function updateInquiry(
  id: string,
  payload: InquiryUpdateInput,
  snapshotPath?: string
): Promise<{ record: InquiryRecord; snapshotPath: string | null } | null> {
  if (getStorageMode() === "unconfigured") {
    return null;
  }

  const current = await readAllInquiries(snapshotPath);
  const index = current.records.findIndex((record) => record.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...current.records[index],
    status: payload.status,
    notes: payload.notes
  };

  current.records[index] = updated;
  const nextSnapshotPath = await writeAllInquiries(current.records);
  return {
    record: updated,
    snapshotPath: nextSnapshotPath
  };
}
