import { getProductByIdService } from '../../services/productsService.js';

export default async function getProductsById(event: {
  pathParameters?: { productId: string };
}) {
  console.log('getProductsById function invoked, event: ', JSON.stringify(event, null, 2));

  if (!event.pathParameters || !event.pathParameters.productId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        {
          error: 'Missing productId',
        },
        null,
        2
      ),
    };
  }

  const productId = event.pathParameters.productId;

  try {
    const product = await getProductByIdService(productId);

    if (product === null) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(
          {
            error: 'Product not found',
          },
          null,
          2
        ),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(product, null, 2),
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
}
