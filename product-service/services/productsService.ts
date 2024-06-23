import { v4 as uuidv4 } from 'uuid';
import {
  getProductsDAL,
  getProductByIdDAL,
  getStockDAL,
  createProductDAL,
} from '../dataAccess/productRepository.js';
import { Product } from '../types/Product.js';
import { Stock } from '../types/Stock.js';

type ProductWithStock = Product & Pick<Stock, 'count'>;

export async function getProductsListService(): Promise<ProductWithStock[]> {
  const products = await getProductsDAL();
  const productsWithStock = await Promise.all(
    products.map(async (product) => {
      const stock = await getStockByProductIdService(product.id);
      return { ...product, count: stock.count || 0 };
    })
  );
  return productsWithStock;
}

export async function getProductByIdService(
  productId: string
): Promise<ProductWithStock | null> {
  const product = await getProductByIdDAL(productId);
  if (!product) {
    return null;
  }

  const stock = await getStockByProductIdService(productId);

  return { ...product, count: stock.count || 0 };
}

export async function getStockByProductIdService(
  productId: string
): Promise<Stock> {
  const stock = await getStockDAL(productId);

  return stock;
}

export async function createProductService(
  productData: Omit<Product, 'id'> & Pick<Stock, 'count'>
): Promise<Product & Pick<Stock, 'count'>> {
  const id = uuidv4();
  const product = await createProductDAL({ ...productData, id });
  return product;
}
