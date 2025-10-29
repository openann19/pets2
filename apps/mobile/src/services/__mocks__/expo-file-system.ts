export const EncodingType = { Base64: 'base64', UTF8: 'utf8' } as const;
export const readAsStringAsync = jest.fn();
export const getInfoAsync = jest.fn();
export const uploadAsync = jest.fn();
export const FileSystemUploadType = { BINARY_CONTENT: 'binary' } as const;

export default {
  EncodingType,
  readAsStringAsync,
  getInfoAsync,
  uploadAsync,
  FileSystemUploadType,
};



