import { storage } from "@adapters/services";
import { FileData, StorageApi } from "shared/interfaces";

class StorageService implements StorageApi {
  async uploadImage(file: FileData, filename: string): Promise<string> {
    // If it's a Buffer, use it directly; if it's a string, convert to Buffer
    const buffer = file instanceof Buffer ? file : Buffer.from(file as string);
    return storage.uploadImage(buffer, filename);
  }

  async uploadFile(
    file: FileData,
    filename: string,
    contentType?: string
  ): Promise<string> {
    const buffer = file instanceof Buffer ? file : Buffer.from(file as string);
    return storage.uploadFile(buffer, filename, contentType);
  }

  async deleteFile(url: string): Promise<boolean> {
    return storage.deleteFile(url);
  }
}

export default new StorageService();
