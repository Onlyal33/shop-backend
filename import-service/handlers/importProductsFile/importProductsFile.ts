import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.REGION });

export default async function importProductsFile(event: {
  queryStringParameters: { name: string };
}) {
  const { name } = event.queryStringParameters || {};

  if (!name) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Missing name query parameter' }),
    };
  }

  const params = {
    Bucket: process.env.S3BUCKET,
    Key: `uploaded/${name}`,
    Expires: 3600,
  };

  try {
    const command = new PutObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: params.Expires });
console.log('url', url)
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(url),
    };
  } catch (error) {
    console.error('Error creating presigned URL', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
}