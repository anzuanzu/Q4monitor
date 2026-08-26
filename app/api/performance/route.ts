import { env } from 'cloudflare:workers';
import { performanceTableSql, performanceUpdatedIndexSql } from '../../../db/schema';

type IncomingRecord = {
  branch?: string;
  advisorName?: string;
  quarterTarget?: string;
  quarterProgress?: string;
  quarterRate?: string;
  fundProgress?: string;
  insuranceProgress?: string;
};

const validBranches = new Set(['板橋分行', '華江分行', '新板分行']);

async function database() {
  const db = env.DB as D1Database;
  await db.batch([db.prepare(performanceTableSql), db.prepare(performanceUpdatedIndexSql)]);
  return db;
}

function authorized(request: Request) {
  return request.headers.get('oai-authenticated-user-id');
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: '請先登入授權帳號。' }, { status: 401 });
  const db = await database();
  const { results } = await db.prepare(`
    SELECT branch, advisor_name, quarter_target, quarter_progress, quarter_rate, fund_progress, insurance_progress, updated_at
    FROM performance_records
    ORDER BY branch, advisor_name
  `).all();
  return Response.json({ records: results ?? [] });
}

export async function PUT(request: Request) {
  const userId = authorized(request);
  if (!userId) return Response.json({ error: '請先登入授權帳號。' }, { status: 401 });
  const payload = await request.json().catch(() => null) as { records?: IncomingRecord[] } | null;
  const records = payload?.records;
  if (!Array.isArray(records) || records.length === 0 || records.length > 100) {
    return Response.json({ error: '請提供 1 至 100 筆績效資料。' }, { status: 400 });
  }
  const db = await database();
  const updatedAt = new Date().toISOString();
  const statements = records.map((record) => {
    if (!record.branch || !record.advisorName || !validBranches.has(record.branch)) throw new Error('資料包含無效的分行或人員姓名。');
    return db.prepare(`
      INSERT INTO performance_records (branch, advisor_name, quarter_target, quarter_progress, quarter_rate, fund_progress, insurance_progress, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(branch, advisor_name) DO UPDATE SET
        quarter_target = excluded.quarter_target,
        quarter_progress = excluded.quarter_progress,
        quarter_rate = excluded.quarter_rate,
        fund_progress = excluded.fund_progress,
        insurance_progress = excluded.insurance_progress,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by
    `).bind(record.branch, record.advisorName, record.quarterTarget ?? '', record.quarterProgress ?? '', record.quarterRate ?? '', record.fundProgress ?? '', record.insuranceProgress ?? '', updatedAt, userId);
  });
  try {
    await db.batch(statements);
    return Response.json({ updated: statements.length, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : '無法儲存資料。' }, { status: 400 });
  }
}
