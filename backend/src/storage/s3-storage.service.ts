import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { env } from "../config/env";
import { StorageService, UploadInput } from "./storage.interface";

/**
 * Works with AWS S3 or any S3-compatible endpoint (MinIO, Cloudflare R2,
 * Backblaze B2) by configuring S3_ENDPOINT + S3_FORCE_PATH_STYLE.
 */
export class S3StorageService implements StorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.s3Region,
      endpoint: env.s3Endpoint,
      forcePathStyle: env.s3ForcePathStyle,
      credentials: env.s3AccessKeyId
        ? { accessKeyId: env.s3AccessKeyId, secretAccessKey: env.s3SecretAccessKey }
        : undefined,
    });
    this.bucket = env.s3Bucket;
  }

  async upload({ key, body, mimeType }: UploadInput): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      })
    );
    return key;
  }

  async download(storagePath: string): Promise<Readable> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: storagePath })
    );
    return result.Body as Readable;
  }

  async delete(storagePath: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storagePath }));
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: storagePath }));
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(storagePath: string): Promise<string | null> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: storagePath });
    return getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour
  }
}
