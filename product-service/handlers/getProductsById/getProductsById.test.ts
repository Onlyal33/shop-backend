import getProductsById from './getProductsById';
import products from '../../products';

describe('getProductsById', () => {
  it('should return a product when a valid id is provided', async () => {
    const event = {
      pathParameters: {
        productId: products[0].id,
      },
    };

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(products[0]);
  });

  it('should return a 400 error when no id is provided', async () => {
    const event = {};

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Missing productId');
  });

  it('should return a 404 error when a product is not found', async () => {
    const event = {
      pathParameters: {
        productId: 'non-existing-id',
      },
    };

    const response = await getProductsById(event);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Product not found');
  });
});