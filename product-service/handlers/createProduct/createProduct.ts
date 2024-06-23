import { createProductService } from '../../services/productsService.js';
import { Product } from '../../types/Product.js';
import { Stock } from '../../types/Stock.js';

type ProductStock = Product & Pick<Stock, 'count'>;

export default async function createProduct(event: { body: Omit<ProductStock, 'id'> }) {
  console.log('createProduct function invoked, event: ', event);

  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid product data' }),
    };
  }

  try {
    const productData = event.body;

    if (
      typeof productData.title !== 'string' ||
      !productData.title ||
      !productData.description ||
      typeof productData.price !== 'number' ||
      typeof productData.count !== 'number' ||
      productData.price <= 0 ||
      productData.count < 0
    ) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid product data' }),
      };
    }

    const product = await createProductService(productData);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(product, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(
        { error: 'Failed to create product: ' + error.message },
        null,
        2
      ),
    };
  }
}
