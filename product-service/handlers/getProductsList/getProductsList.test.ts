import getProductsList from './getProductsList';
import products from '../../products';

describe('getProductsList', () => {
  it('should return a response with a status code of 200 and a body containing the products', async () => {
    const response = await getProductsList();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(JSON.stringify(products, null, 2));
  });
});
