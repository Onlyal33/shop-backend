import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '../types/Product.js';
import { Stock } from '../types/Stock.js';

const dynamoDBClient = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export async function getProductsDAL(): Promise<Product[]> {
  const productsResult = await docClient.send(
    new ScanCommand({ TableName: process.env.PRODUCTS_TABLE })
  );

  const products: Product[] = productsResult.Items?.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
  })) as Product[];

  return products;
}

export async function getProductByIdDAL(
  productId: string
): Promise<Product | null> {
  const productResult = await docClient.send(
    new QueryCommand({
      TableName: process.env.PRODUCTS_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': productId,
      },
    })
  );

  if (productResult.Items.length === 0) {
    return null;
  }

  return productResult.Items[0] as Product;
}

export async function getStockDAL(productId: string): Promise<Stock> {
  const stockResult = await docClient.send(
    new QueryCommand({
      TableName: process.env.STOCK_TABLE,
      KeyConditionExpression: 'product_id = :product_id',
      ExpressionAttributeValues: {
        ':product_id': productId,
      },
    })
  );
  return stockResult.Items[0] as Stock;
}

export async function createProductDAL(product: Product & Pick<Stock, 'count'>): Promise<Product & Pick<Stock, 'count'>> {

  const { count, ...productDataWithoutCount } = product;

  const transactionCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE,
          Item: productDataWithoutCount,
        },
      },
      {
        Put: {
          TableName: process.env.STOCK_TABLE,
          Item: { product_id: product.id, count },
        },
      },
    ],
  });

  await docClient.send(transactionCommand);

  return product;
}