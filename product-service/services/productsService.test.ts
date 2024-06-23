import * as productService from './productsService.js';
import * as productRepository from '../dataAccess/productRepository.js';
import mockProducts from '../products.js';

jest.mock('../dataAccess/productRepository');

describe('productsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProductService', () => {
    it('should create a product and return it', async () => {
      const mockProductData = {
        title: 'Test Product',
        description: 'Test Description',
        price: 100,
        count: 10,
      };
      const expectedProduct = { ...mockProductData, id: '1' };

      (productRepository.createProductDAL as jest.Mock).mockResolvedValue(
        expectedProduct
      );

      const result = await productService.createProductService(mockProductData);

      expect(result).toEqual({ ...expectedProduct, id: result.id });
      expect(productRepository.createProductDAL).toHaveBeenCalledWith({
        ...mockProductData,
        id: expect.any(String),
      });
    });
  });

  describe('getProductByIdService', () => {
    it('should return a product with stock when found', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        title: 'Test Product',
        description: 'Test Description',
        price: 100,
      };
      const mockStock = { count: 10 };

      (productRepository.getProductByIdDAL as jest.Mock).mockResolvedValue(
        mockProduct
      );
      (productRepository.getStockDAL as jest.Mock).mockResolvedValue(mockStock);

      const result = await productService.getProductByIdService(productId);

      expect(result).toEqual({ ...mockProduct, count: mockStock.count });
      expect(productRepository.getProductByIdDAL).toHaveBeenCalledWith(
        productId
      );
      expect(productRepository.getStockDAL).toHaveBeenCalledWith(productId);
    });
  });

  describe('getProductsService', () => {
    it('should return an array of products', async () => {
      (productRepository.getProductsDAL as jest.Mock).mockResolvedValue(
        mockProducts
      );
      (productRepository.getStockDAL as jest.Mock).mockImplementation(
        (productId) => {
          const product = mockProducts.find((p) => p.id === productId);
          return Promise.resolve(product || null);
        }
      );

      const result = await productService.getProductsListService();

      expect(result).toEqual(mockProducts);
      expect(productRepository.getProductsDAL).toHaveBeenCalled();
    });
  });
});
