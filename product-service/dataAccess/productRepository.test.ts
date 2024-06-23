import { DynamoDBDocumentClient, QueryCommand, ScanCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { getProductsDAL, getProductByIdDAL, getStockDAL, createProductDAL } from './productRepository.js'; // Adjust the path accordingly

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('DAL Functions', () => {
  describe('getProductsDAL', () => {
    it('should return products', async () => {
      const mockProducts = [{ id: '1', title: 'Product 1', description: 'Description 1', price: 100 }];
      ddbMock.on(ScanCommand).resolves({ Items: mockProducts });

      const result = await getProductsDAL();
      expect(result).toEqual(mockProducts);
      expect(ddbMock.calls()).toHaveLength(1);
    });
  });

  describe('getProductByIdDAL', () => {
    it('should return product by ID', async () => {
      const mockProduct = { id: '1', title: 'Product 1', description: 'Description 1', price: 100 };
      ddbMock.on(QueryCommand).resolves({ Items: [mockProduct] });

      const result = await getProductByIdDAL('1');
      expect(result).toEqual(mockProduct);
      expect(ddbMock.calls()).toHaveLength(1);
    });

    it('should return null if product not found', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      const result = await getProductByIdDAL('999');
      expect(result).toBeNull();
      expect(ddbMock.calls()).toHaveLength(1);
    });
  });

  describe('getStockDAL', () => {
    it('should return stock for a product', async () => {
      const mockStock = { product_id: '1', count: 100 };
      ddbMock.on(QueryCommand).resolves({ Items: [mockStock] });

      const result = await getStockDAL('1');
      expect(result).toEqual(mockStock);
      expect(ddbMock.calls()).toHaveLength(1);
    });
  });

  describe('createProductDAL', () => {
    it('should create a product and stock', async () => {
      const newProduct = { id: '1', title: 'Product 1', description: 'Test 1', price: 10, count: 100 };

      ddbMock.on(TransactWriteCommand).resolves({});

      const result = await createProductDAL(newProduct);
      expect(result).toEqual(newProduct);
      expect(ddbMock.calls()).toHaveLength(1);
      const call = ddbMock.calls()[0].args[0] as TransactWriteCommand;
      expect(call.input.TransactItems).toEqual([
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE,
            Item: { id: '1', title: 'Product 1', description: 'Test 1', price: 10 }
          }
        },
        {
          Put: {
            TableName: process.env.STOCK_TABLE,
            Item: { product_id: '1', count: 100 }
          }
        }
      ]);
    });
  });
});
