// Client Cloudflare R2 (compatible S3) pour le stockage des fichiers audio.
// Anti-israf : aucun fichier image ou document — uniquement les enregistrements audio
// des annonces et événements des mosquées.
//
// Variables d'environnement requises :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_BUCKET_NAME, R2_PUBLIC_URL

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const accountId    = process.env.R2_ACCOUNT_ID!
const accessKeyId  = process.env.R2_ACCESS_KEY_ID!
const secretKey    = process.env.R2_SECRET_ACCESS_KEY!
const bucketName   = process.env.R2_BUCKET_NAME!
const publicUrl    = process.env.R2_PUBLIC_URL!

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey: secretKey,
  },
})

/**
 * Upload un fichier audio vers R2.
 * @param key       Chemin dans le bucket, ex: "mosques/42/announcements/1234567890.webm"
 * @param buffer    Contenu du fichier en Buffer
 * @param mimeType  Type MIME : "audio/webm" | "audio/mp4" | "audio/ogg"
 * @returns         URL publique du fichier
 */
export async function uploadAudio(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket:      bucketName,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
      // Cache 1 an — les fichiers audio ne changent pas
      CacheControl: "public, max-age=31536000",
    })
  )
  return `${publicUrl}/${key}`
}

/**
 * Supprime un fichier audio de R2.
 * @param key  Chemin dans le bucket
 */
export async function deleteAudio(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: key })
  )
}

/**
 * Extrait la clé R2 depuis une URL publique.
 * Ex: "https://pub-xxx.r2.dev/mosques/42/..." → "mosques/42/..."
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const base = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/"
    if (!url.startsWith(base)) return null
    return url.slice(base.length)
  } catch {
    return null
  }
}
