import mockProducts from '../../products';
import { getProductsListService } from '../../services/productsService.js';
import getProductsList from './getProductsList.js';

jest.mock('../../services/productsService.js');

describe('getProductsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a response with a status code of 200 and a body containing the products', async () => {
    (getProductsListService as jest.Mock).mockResolvedValue(mockProducts);

    const response = await getProductsList();

    expect(getProductsListService).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mockProducts, null, 2),
    });
  });

  it('should return 500 and error message on service failure', async () => {
    const mockError = new Error('Service failure');
    (getProductsListService as jest.Mock).mockRejectedValue(mockError);

    const response = await getProductsList();

    expect(getProductsListService).toHaveBeenCalledTimes(1);
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
