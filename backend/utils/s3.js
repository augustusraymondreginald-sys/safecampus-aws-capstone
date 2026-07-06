const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// On EC2, this picks up credentials automatically from the instance's IAM Role —
// no access keys needed in production. That's the least-privilege setup your
// project guide asks for: the EC2 role only gets s3:PutObject on this one bucket.
const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Generates a pre-signed URL the frontend can PUT a photo directly to S3 with —
 * the file never passes through our EC2 server, which keeps the backend light
 * and avoids ever writing user uploads to local disk.
 */
async function getPresignedUploadUrl(fileName, fileType) {
  const key = `incident-evidence/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  return { uploadUrl, key };
}

module.exports = { getPresignedUploadUrl };
