import mockProducts from '../../products';
import { getProductByIdService } from '../../services/productsService.js';
import getProductsById from './getProductsById';

jest.mock('../../services/productsService.js');

describe('getProductsById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a product when a valid id is provided', async () => {
    (getProductByIdService as jest.Mock).mockResolvedValue(mockProducts[0]);

    const event = {
      pathParameters: {
        productId: mockProducts[0].id,
      },
    };

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockProducts[0]);
  });

  it('should return a 400 error when no id is provided', async () => {
    const event = {};

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Missing productId');
  });

  it('should return a 404 error when a product is not found', async () => {
    (getProductByIdService as jest.Mock).mockResolvedValue(null);

    const event = {
      pathParameters: {
        productId: 'non-existing-id',
      },
    };

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Product not found');
  });

  it('should return 500 and error message on service failure', async () => {
    const mockError = new Error('Service failure');
    (getProductByIdService as jest.Mock).mockRejectedValue(mockError);

    const event = {
      pathParameters: {
        productId: 'someid',
      },
    };

    const response = await getProductsById(event);

    expect(getProductByIdService).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        {
          error: 'An error occurred while getting the product: Service failure',
        },
        null,
        2
      ),
    });
  });
});