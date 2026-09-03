import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

let client: S3Client | null = null;

function storageConfig() {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    const error: any = new Error(
      'Resume storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET.',
    );
    error.statusCode = 503;
    throw error;
  }
  return {
    endpoint: R2_ENDPOINT,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
  };
}

function storageClient() {
  if (client) return client;
  const config = storageConfig();
  client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  return client;
}

export async function putFile(key: string, body: Buffer, contentType: string) {
  await storageClient().send(
    new PutObjectCommand({
      Bucket: storageConfig().bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getFile(key: string) {
  return storageClient().send(new GetObjectCommand({ Bucket: storageConfig().bucket, Key: key }));
}

export async function deleteFile(key: string) {
  await storageClient().send(new DeleteObjectCommand({ Bucket: storageConfig().bucket, Key: key }));
}
