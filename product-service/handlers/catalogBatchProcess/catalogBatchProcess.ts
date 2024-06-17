import { SQSEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { createProductService } from '../../services/productsService.js';

const snsClient = new SNSClient({ region: process.env.REGION });

export default async function catalogBatchProcess(event: SQSEvent) {
  console.log('Event:', event);
  for (const record of event.Records) {
    try {
      const product = JSON.parse(record.body);
      const createdProduct = await createProductService(product);

      const params = {
        Subject: "New Product Creation Notification",
        Message: `A new product has been created: ${JSON.stringify(
          createdProduct
        )}`,
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
      };

      const command = new PublishCommand(params);
      await snsClient.send(command);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  }
}
