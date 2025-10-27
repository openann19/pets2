export const getInfoAsync = jest.fn(async (_path: string) => ({
  exists: true, size: 12345, isDirectory: false, uri: 'file:///tmp/test.jpg'
}));
export const copyAsync = jest.fn(async () => undefined);
export const deleteAsync = jest.fn(async () => undefined);
