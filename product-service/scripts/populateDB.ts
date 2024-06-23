import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import products from '../products.js';
import { Product } from '../types/Product.js';
import { Stock } from '../types/Stock.js';

const dynamoDbClient = new DynamoDBClient({
  region: 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

const productsData: Product[] = products.map(
  ({ id, title, description, price }) => ({ id, title, description, price })
);

const stockData: Stock[] = products.map(({ id, count }) => ({
  product_id: id,
  count,
}));

const putItems = async <T>(tableName: string, items: T[]): Promise<void> => {
  for (const item of items) {
    const params = {
      TableName: tableName,
      Item: item,
    };
    try {
      await docClient.send(new PutCommand(params));
      console.log(`Inserted item into ${tableName}:`, item);
    } catch (error) {
      console.error(`Error inserting item into ${tableName}:`, error);
    }
  }
};

const fillTables = async (): Promise<void> => {
  await putItems<Product>('product', productsData);
  await putItems<Stock>('stock', stockData);
};

fillTables();
