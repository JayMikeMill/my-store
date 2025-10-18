// backend/src/crud/FirebaseCRUD.ts
import { useFirebase } from "./config/firebaseAdmin";
import type { CrudInterface } from "shared/interfaces";
import { QueryType } from "shared/types";

export class FirebaseCrudAdapter<T extends { id?: string }>
  implements CrudInterface<T>
{
  private db = useFirebase().db;
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async create(data: T): Promise<T> {
    const docRef = data.id
      ? this.db.collection(this.collection).doc(data.id)
      : this.db.collection(this.collection).doc();
    await docRef.set(data);
    return { ...data, id: docRef.id };
  }

  // -------------------- GET --------------------
  async getOne(query: QueryType<T>): Promise<T | null> {
    const collectionRef = this.db.collection(this.collection);

    // By ID
    if ("id" in query && query.id) {
      const doc = await collectionRef.doc(query.id).get();
      return doc.exists ? ({ ...doc.data(), id: doc.id } as T) : null;
    }

    // Partial query
    const keys = Object.keys(query) as (keyof T)[];
    if (keys.length > 0) {
      let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
        collectionRef;

      keys.forEach((key) => {
        queryRef = queryRef.where(
          String(key),
          "==",
          (query as Partial<T>)[key]
        );
      });

      const snapshot = await queryRef.get();
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
      return data[0] ?? null;
    }

    return null;
  }

  async getMany(
    query?: QueryType<T>
  ): Promise<{ data: T[]; total: number } | null> {
    const collectionRef = this.db.collection(this.collection);

    if (query && Object.keys(query).length > 0) {
      let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
        collectionRef;

      (Object.keys(query) as (keyof T)[]).forEach((key) => {
        queryRef = queryRef.where(
          String(key),
          "==",
          (query as Partial<T>)[key]
        );
      });

      const snapshot = await queryRef.get();
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
      return { data, total: data.length };
    }

    // Get all
    const snapshot = await collectionRef.get();
    const allData = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
    return { data: allData, total: snapshot.size };
  }

  async update(updates: Partial<T> & { id?: string }): Promise<T> {
    if (!updates.id) throw new Error("Document id is required for update");
    const docRef = this.db.collection(this.collection).doc(updates.id);
    const doc = await docRef.get();
    if (!doc.exists)
      throw new Error(`Document with id ${updates.id} does not exist`);
    await docRef.update(updates);
    return { ...(doc.data() as T), ...updates, id: updates.id };
  }

  async delete(id: string): Promise<T> {
    const docRef = this.db.collection(this.collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error(`Document with id ${id} does not exist`);
    await docRef.delete();
    return { ...doc.data(), id } as T;
  }
}
