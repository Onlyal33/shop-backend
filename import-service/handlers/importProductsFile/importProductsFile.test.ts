import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import importProductsFile from './importProductsFile';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(),
    PutObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn(),
  };
});

const s3ClientMock = new S3Client();

describe('importProductsFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if name query parameter is missing', async () => {
    const event = {
      queryStringParameters: {},
    } as any;

    const response = await importProductsFile(event);

    expect(response).toEqual({
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Missing name query parameter' }),
    });
  });

  it('should return 200 and presigned URL if name query parameter is provided', async () => {
    const name = 'testfile.csv';
    const event = {
      queryStringParameters: { name },
    };

    const mockUrl = 'https://example.com/presigned-url';
    (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

    const response = await importProductsFile(event);

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(mockUrl),
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      s3ClientMock,
      expect.any(PutObjectCommand),
      { expiresIn: 3600 }
    );
  });

  it('should return 500 if there is an error generating the presigned URL', async () => {
    const name = 'testfile.csv';
    const event = {
      queryStringParameters: { name },
    };

    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Failed to generate URL'));

    const response = await importProductsFile(event);

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      s3ClientMock,
      expect.any(PutObjectCommand),
      { expiresIn: 3600 }
    );
  });
});
