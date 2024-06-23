import { getProductsListService } from '../../services/productsService.js';

export default async function getProductsList() {
  console.log('getProductsList function invoked');

  try {
    const products = await getProductsListService();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(products, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        {
          error:
            'An error occurred while getting the product: ' + error.message,
        },
        null,
        2
      ),
    };
  }
};
