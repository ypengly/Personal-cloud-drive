import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  localStorageDir: process.env.LOCAL_STORAGE_DIR ?? "./storage-data",
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 200),

  s3Endpoint: process.env.S3_ENDPOINT || undefined,
  s3Region: process.env.S3_REGION ?? "us-east-1",
  s3Bucket: process.env.S3_BUCKET ?? "personal-cloud-drive",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",

  defaultStorageQuota: Number(process.env.DEFAULT_STORAGE_QUOTA ?? 10_737_418_240),
};
