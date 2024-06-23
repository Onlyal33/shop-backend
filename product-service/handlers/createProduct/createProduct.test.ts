import createProduct from './createProduct.js';
import { createProductService } from '../../services/productsService.js';
import mockProducts from '../../products.js';

jest.mock('../../services/productsService.js');

describe('createProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully creates a product when valid data is provided', async () => {
    (createProductService as jest.Mock).mockResolvedValue(mockProducts[0]);

    const { id, ...mockProductData } = mockProducts[0];

    const event = {
      body: mockProductData,
    };

    const result = await createProduct(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockProducts[0]);
  });

  it('returns a 400 error if event body is not provided', async () => {
    const event = {} as any;
    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if title is missing', async () => {
    const invalidProductData = JSON.stringify({
      description: 'Test Description',
      price: 100,
      count: 10,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if title is not a string', async () => {
    const invalidProductData = JSON.stringify({
      title: 123,
      description: 'Test Description',
      price: 100,
      count: 10,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if description is missing', async () => {
    const invalidProductData = JSON.stringify({
      title: 'Test Product',
      price: 100,
      count: 10,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if price is not a number', async () => {
    const invalidProductData = JSON.stringify({
      title: 'Test Product',
      description: 'Test Description',
      price: '100',
      count: 10,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if price is less than or equal to 0', async () => {
    const invalidProductData = JSON.stringify({
      title: 'Test Product',
      description: 'Test Description',
      price: 0,
      count: 10,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if count is not a number', async () => {
    const invalidProductData = JSON.stringify({
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      count: '10',
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('returns a 400 error if count is less than 0', async () => {
    const invalidProductData = JSON.stringify({
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      count: -1,
    });

    const event = {
      body: invalidProductData,
    } as any;

    const result = await createProduct(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Invalid product data');
    expect(createProductService).not.toHaveBeenCalled();
  });

  it('should return 500 and error message on service failure', async () => {
    const mockError = new Error('Service failure');
    (createProductService as jest.Mock).mockRejectedValue(mockError);

    const { id, ...mockProductData } = mockProducts[0];

    const event = {
      body: mockProductData,
    };

    const response = await createProduct(event);

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        {
          error: 'Failed to create product: Service failure',
        },
        null,
        2
      ),
    });
  });
});
