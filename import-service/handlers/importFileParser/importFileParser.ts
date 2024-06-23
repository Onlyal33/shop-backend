import { S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

const s3Client = new S3Client({ region: process.env.REGION });

export const importFileParser = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const s3Object = record.s3.object;
    const bucketName = record.s3.bucket.name;
    const objectKey = s3Object.key;

    const getObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const command = new GetObjectCommand(getObjectParams);

    try {
      const s3Response = await s3Client.send(command);
      const s3Stream = s3Response.Body as Readable;

      await new Promise<void>((resolve, reject) => {
        s3Stream
          .pipe(csvParser())
          .on('data', (data) => {
            console.log(data);
          })
          .on('end', async () => {
            console.log(`CSV file ${objectKey} processing completed`);
            try {
              const copyParams = {
                Bucket: bucketName,
                CopySource: `${bucketName}/${objectKey}`,
                Key: objectKey.replace('uploaded/', 'parsed/'),
              };
              const copyCommand = new CopyObjectCommand(copyParams);
              await s3Client.send(copyCommand);

              const deleteParams = {
                Bucket: bucketName,
                Key: objectKey,
              };
              const deleteCommand = new DeleteObjectCommand(deleteParams);
              await s3Client.send(deleteCommand);

              console.log(`File ${objectKey} moved to parsed folder`);
              resolve();
            } catch (moveError) {
              console.error(`Error moving file ${objectKey}:`, moveError);
              reject(moveError);
            }
          })
          .on('error', (error) => {
            console.error(`Error processing CSV file ${objectKey}:`, error);
            reject(error);
          });
      });
    } catch (error) {
      console.error(
        `Error getting object ${objectKey} from bucket ${bucketName}:`,
        error
      );
    }
  }
};
