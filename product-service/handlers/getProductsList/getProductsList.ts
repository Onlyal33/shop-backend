import products from '../../products.js';

export default async function getProductsList () {
  try {
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
          error: 'An error occurred while getting the product: ' + error.message,
        },
        null,
        2
      ),
    };
  }
};