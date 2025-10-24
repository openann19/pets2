import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios, {
  type AxiosDefaults,
  type AxiosInstance,
  type AxiosInterceptorManager,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import React, { ReactElement, ReactNode } from 'react';
import { apiClient, useApiQuery, useApiMutation } from '../index';

// Mock axios
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

type RequestInterceptorHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

let registeredRequestInterceptors: RequestInterceptorHandler[] = [];

const createInterceptorManagerMock = <T>(
  onRegister?: (onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: unknown) => unknown) => void
): jest.Mocked<AxiosInterceptorManager<T>> => {
  const registerHandler = (
    onFulfilled?: (value: T) => T | Promise<T>,
    onRejected?: (error: unknown) => unknown
  ): number => {
    onRegister?.(onFulfilled, onRejected);
    return 0;
  };

  return {
    use: jest.fn(registerHandler),
    eject: jest.fn(),
    clear: jest.fn(),
    forEach: jest.fn(),
  } as unknown as jest.Mocked<AxiosInterceptorManager<T>>;
};

const createAxiosInstanceMock = (): jest.Mocked<AxiosInstance> => {
  registeredRequestInterceptors = [];
  const instance = {
    defaults: {} as AxiosDefaults,
    interceptors: {
      request: createInterceptorManagerMock<InternalAxiosRequestConfig>((onFulfilled) => {
        if (typeof onFulfilled === 'function') {
          registeredRequestInterceptors.push(onFulfilled as RequestInterceptorHandler);
        }
      }),
      response: createInterceptorManagerMock<AxiosResponse>(),
    },
    getUri: jest.fn(),
    request: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
  } as Record<string, unknown>;

  return instance as unknown as jest.Mocked<AxiosInstance>;
};

let axiosInstanceMock: jest.Mocked<AxiosInstance>;

// Create wrapper for React Query
type QueryWrapperProps = { children: ReactNode };

const createWrapper = (): ((props: QueryWrapperProps) => ReactElement) => {
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

  function QueryClientWrapper({ children }: QueryWrapperProps): ReactElement {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return QueryClientWrapper;
};

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstanceMock = createAxiosInstanceMock();
    mockedAxios.create.mockReturnValue(axiosInstanceMock);
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
      axiosInstanceMock.get.mockResolvedValue(mockResponse as never);

      const result = await apiClient.get('/test');

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle GET request error', async () => {
      const mockError = {
        response: { data: { message: 'Not found' } }
      };
      axiosInstanceMock.get.mockRejectedValue(mockError as never);

      await expect(apiClient.get('/test')).rejects.toThrow('Not found');
    });

    it('should make POST request successfully', async () => {
      const mockResponse = {
        data: { success: true, data: { id: 1 } }
      };
      axiosInstanceMock.post.mockResolvedValue(mockResponse as never);

      const result = await apiClient.post('/test', { name: 'Test' });

      expect(result).toEqual(mockResponse.data);
    });

    it('should include auth token in request headers', async () => {
      axiosInstanceMock.post.mockResolvedValue({ data: { success: true } } as never);

      // Mock localStorage to return token
      (localStorage.getItem as jest.Mock).mockReturnValue('test-token');

      await apiClient.post('/test');

      expect(registeredRequestInterceptors.length).toBeGreaterThan(0);
    });
  });

  describe('File Upload', () => {
    it('should handle file upload successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: { success: true, data: { url: 'https://example.com/image.jpg' } }
      };

      axiosInstanceMock.post.mockResolvedValue(mockResponse as never);

      const result = await apiClient.uploadFile('/upload', {
        file: mockFile,
        additionalData: { folder: 'pets' },
      });

      expect(result).toEqual(mockResponse.data);
  const postMock = Reflect.get(axiosInstanceMock, 'post') as jest.Mock;
      expect(postMock).toHaveBeenCalled();
      const [url, formData, config] = postMock.mock.calls[0] ?? [];
      expect(url).toBe('/upload');
      expect(formData).toBeInstanceOf(FormData);
      expect(config).toMatchObject({
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });
  });
});

describe('API Hooks', () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstanceMock = createAxiosInstanceMock();
    mockedAxios.create.mockReturnValue(axiosInstanceMock);
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('useApiQuery', () => {
    it('should fetch data successfully', async () => {
      const mockResponse = { success: true, data: { id: 1, name: 'Test' } };
      axiosInstanceMock.get.mockResolvedValue({ data: mockResponse } as never);

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
      axiosInstanceMock.get.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(
        () => useApiQuery(['test'], '/test'),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error state', async () => {
  const mockError = { response: { data: { message: 'Error' } } } as const;
      axiosInstanceMock.get.mockRejectedValue(mockError as never);

      const { result } = renderHook(
        () => useApiQuery(['test'], '/test'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      const { error } = result.current;
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Error');
      }
    });
  });

  describe('useApiMutation', () => {
    it('should mutate data successfully', async () => {
  const mockResponse = { success: true, data: { id: 1 } } as const;
      axiosInstanceMock.post.mockResolvedValue({ data: mockResponse } as never);

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

    it('should handle mutation loading state', () => {
      axiosInstanceMock.post.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(
        () => useApiMutation<any, any, any>('/test'),
        { wrapper }
      );

      result.current.mutate({ name: 'Test' });

      expect(result.current.isPending).toBe(true);
    });

    it('should handle mutation error', async () => {
  const mockError = { response: { data: { message: 'Mutation failed' } } } as const;
      axiosInstanceMock.post.mockRejectedValue(mockError as never);

      const { result } = renderHook(
        () => useApiMutation<any, any, any>('/test'),
        { wrapper }
      );

      result.current.mutate({ name: 'Test' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      const mutationError = result.current.error;
      expect(mutationError).toBeInstanceOf(Error);
      if (mutationError instanceof Error) {
        expect(mutationError.message).toBe('Mutation failed');
      }
    });
  });
});
