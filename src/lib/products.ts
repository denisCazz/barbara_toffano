import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDb } from './db';

export type ProductCategory = 'consulto' | 'meditazione' | 'lettura' | 'vendita';
export type DeliveryType = 'audio' | 'carta' | 'pacchetto';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  delivery_type: DeliveryType;
  icon: string;
  details: string[];
  info_url?: string | null;
  info_label?: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
}

function parseDetails(detailsJson: any): string[] {
  if (!detailsJson) return [];
  if (Array.isArray(detailsJson)) return detailsJson.map(String);
  try {
    const v = typeof detailsJson === 'string' ? JSON.parse(detailsJson) : detailsJson;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function mapProductRow(r: any): Product {
  const u = r.info_url != null ? String(r.info_url).trim() : '';
  const l = r.info_label != null ? String(r.info_label).trim() : '';
  const fallback =
    typeof process !== 'undefined' && process.env?.PRODUCT_BAMBOLE_VIDEO_URL
      ? process.env.PRODUCT_BAMBOLE_VIDEO_URL.trim()
      : '';

  let info_url = u || null;
  let info_label = l || null;
  if ((Number(r.id) === 5 || Number(r.id) === 6) && !info_url && fallback) {
    info_url = fallback;
    info_label = info_label ?? 'Scopri di più (video sul mazzo)';
  }

  return {
    id: Number(r.id),
    name: String(r.name),
    description: String(r.description),
    price: Number(r.price),
    category: r.category,
    delivery_type: r.delivery_type,
    icon: String(r.icon ?? '✦'),
    details: parseDetails(r.details_json),
    info_url,
    info_label,
    featured: Boolean(r.featured),
    is_active: Boolean(r.is_active),
    sort_order: Number(r.sort_order ?? 0),
  };
}

export async function listActiveProducts(): Promise<Product[]> {
  const db = getDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT id, name, description, price, category, delivery_type, icon, details_json, info_url, info_label, featured, is_active, sort_order
     FROM products
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC`,
  );
  return (rows as any[]).map(mapProductRow);
}

export async function listAllProducts(): Promise<Product[]> {
  const db = getDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT id, name, description, price, category, delivery_type, icon, details_json, info_url, info_label, featured, is_active, sort_order
     FROM products
     ORDER BY sort_order ASC, id ASC`,
  );
  return (rows as any[]).map(mapProductRow);
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = getDb();
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT id, name, description, price, category, delivery_type, icon, details_json, info_url, info_label, featured, is_active, sort_order
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [id],
  );
  const r = (rows as any[])[0];
  return r ? mapProductRow(r) : null;
}

export interface UpsertProductInput {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  delivery_type: DeliveryType;
  icon: string;
  details: string[];
  info_url: string | null;
  info_label: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export async function createProduct(input: UpsertProductInput): Promise<number> {
  const db = getDb();
  const [res] = await db.execute<ResultSetHeader>(
    `INSERT INTO products
      (name, description, price, category, delivery_type, icon, details_json, info_url, info_label, featured, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.description,
      input.price,
      input.category,
      input.delivery_type,
      input.icon || '✦',
      JSON.stringify(input.details ?? []),
      input.info_url?.trim() || null,
      input.info_label?.trim() || null,
      input.featured ? 1 : 0,
      input.is_active ? 1 : 0,
      input.sort_order ?? 0,
    ],
  );
  return Number(res.insertId);
}

export async function updateProduct(id: number, input: UpsertProductInput): Promise<void> {
  const db = getDb();
  await db.execute(
    `UPDATE products
     SET name = ?, description = ?, price = ?, category = ?, delivery_type = ?, icon = ?,
         details_json = ?, info_url = ?, info_label = ?, featured = ?, is_active = ?, sort_order = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      input.name,
      input.description,
      input.price,
      input.category,
      input.delivery_type,
      input.icon || '✦',
      JSON.stringify(input.details ?? []),
      input.info_url?.trim() || null,
      input.info_label?.trim() || null,
      input.featured ? 1 : 0,
      input.is_active ? 1 : 0,
      input.sort_order ?? 0,
      id,
    ],
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDb();
  await db.execute(`DELETE FROM products WHERE id = ?`, [id]);
}

