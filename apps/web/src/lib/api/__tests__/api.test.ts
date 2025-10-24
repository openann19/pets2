import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient, useApiQuery, useApiMutation } from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('HTTP Methods', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        data: { success: true, data: { id: 1, name: 'Test' } }
      };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiClient.get('/test');

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle GET request error', async () => {
      const mockError = {
        response: { data: { message: 'Not found' } }
      };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError)
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Not found');
    });

    it('should make POST request successfully', async () => {
      const mockResponse = {
        data: { success: true, data: { id: 1 } }
      };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiClient.post('/test', { name: 'Test' });

      expect(result).toEqual(mockResponse.data);
    });

    it('should include auth token in request headers', async () => {
      const mockAxiosInstance = {
        post: jest.fn().mockResolvedValue({ data: { success: true } }),
        interceptors: {
          request: {
            use: jest.fn()
          },
          response: {
            use: jest.fn()
          }
        }
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance);

      // Mock localStorage to return token
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      await apiClient.post('/test');

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should handle file upload successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: { success: true, data: { url: 'https://example.com/image.jpg' } }
      };

      const mockAxiosInstance = {
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance);

      const result = await apiClient.uploadFile('/upload', mockFile, { folder: 'pets' });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
    });
  });
});

describe('API Hooks', () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('useApiQuery', () => {
    it('should fetch data successfully', async () => {
      const mockResponse = { success: true, data: { id: 1, name: 'Test' } };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const { result } = renderHook(
        () => useApiQuery(['test'], '/test'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle loading state', () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
      });

      const { result } = renderHook(
        () => useApiQuery(['test'], '/test'),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error state', async () => {
      const mockError = { response: { data: { message: 'Error' } } };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError)
      });

      const { result } = renderHook(
        () => useApiQuery(['test'], '/test'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Error');
    });
  });

  describe('useApiMutation', () => {
    it('should mutate data successfully', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const { result } = renderHook(
        () => useApiMutation<any, any, any>('/test'),
        { wrapper }
      );

      result.current.mutate({ name: 'Test' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle mutation loading state', async () => {
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockImplementation(() => new Promise(() => {}))
      });

      const { result } = renderHook(
        () => useApiMutation<any, any, any>('/test'),
        { wrapper }
      );

      result.current.mutate({ name: 'Test' });

      expect(result.current.isPending).toBe(true);
    });

    it('should handle mutation error', async () => {
      const mockError = { response: { data: { message: 'Mutation failed' } } };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError)
      });

      const { result } = renderHook(
        () => useApiMutation<any, any, any>('/test'),
        { wrapper }
      );

      result.current.mutate({ name: 'Test' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Mutation failed');
    });
  });
});
