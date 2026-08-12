/**
 * Adaptador SQLite del puerto OrderRepository (node:sqlite, sin deps nativas).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Money } from "../../shared/money.vo";
import {
  Order,
  OrderItem,
  type OrderStatus,
} from "../domain/order.entity";
import type { OrderRepository } from "../domain/order.repository";

interface StoredItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

interface OrderRow {
  id: string;
  customer_id: string;
  status: string;
  items_json: string;
}

export class SqliteOrderRepository implements OrderRepository {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        status TEXT NOT NULL,
        items_json TEXT NOT NULL
      );
    `);
  }

  async save(order: Order): Promise<void> {
    const items: StoredItem[] = order.getItems().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount,
      currency: item.unitPrice.currency,
    }));

    this.db
      .prepare(
        `
        INSERT INTO orders (id, customer_id, status, items_json)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          customer_id = excluded.customer_id,
          status = excluded.status,
          items_json = excluded.items_json
      `
      )
      .run(
        order.id,
        order.customerId,
        order.getStatus(),
        JSON.stringify(items)
      );
  }

  async findById(id: string): Promise<Order | null> {
    const row = this.db
      .prepare(
        `SELECT id, customer_id, status, items_json FROM orders WHERE id = ?`
      )
      .get(id) as OrderRow | undefined;

    if (!row) return null;

    const storedItems = JSON.parse(row.items_json) as StoredItem[];
    const items = storedItems.map(
      (item) =>
        new OrderItem(
          item.productId,
          item.quantity,
          Money.of(item.unitPrice, item.currency)
        )
    );

    return Order.reconstitute(
      row.id,
      row.customer_id,
      items,
      row.status as OrderStatus
    );
  }
}
