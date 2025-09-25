// backend/src/crud/FirebaseCRUD.ts
import { db } from "@config/firebase/firebaseAdmin";
import type { CRUDInterface } from "@shared/types/crud-interface";

export class FirebaseCRUDAdapter<T extends { id?: string }>
  implements CRUDInterface<T>
{
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  async create(data: T): Promise<T> {
    const docRef = data.id
      ? db.collection(this.collection).doc(data.id)
      : db.collection(this.collection).doc();
    await docRef.set(data);
    return { ...data, id: docRef.id };
  }

  async get(id: string): Promise<T | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    return doc.exists ? ({ ...doc.data(), id: doc.id } as T) : null;
  }

  async getAll(): Promise<{ data: T[]; total: number }> {
    const snapshot = await db.collection(this.collection).get();
    interface GetAllResult<T> {
      data: T[];
      total: number;
    }

    interface FirestoreDocumentSnapshot<T> {
      data(): T | undefined;
      id: string;
    }

    interface FirestoreQuerySnapshot<T> {
      docs: FirestoreDocumentSnapshot<T>[];
      size: number;
    }

    const typedSnapshot = snapshot as unknown as FirestoreQuerySnapshot<T>;

    return {
      data: typedSnapshot.docs.map(
        (d: FirestoreDocumentSnapshot<T>) => ({ ...d.data(), id: d.id }) as T
      ),
      total: typedSnapshot.size,
    } as GetAllResult<T>;
  }

  async update(updates: Partial<T> & { id?: string }): Promise<T> {
    if (!updates.id) {
      throw new Error("Document id is required for update");
    }
    const docRef = db.collection(this.collection).doc(updates.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`Document with id ${updates.id} does not exist`);
    }
    await docRef.update(updates);
    return { ...(doc.data() as T), ...updates, id: updates.id };
  }

  async delete(id: string): Promise<T> {
    const docRef = db.collection(this.collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`Document with id ${id} does not exist`);
    }
    await docRef.delete();
    return { ...doc.data(), id } as T;
  }
}
