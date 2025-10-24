// Mock for sharp module to avoid native module issues in tests
export default jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
    toFile: jest.fn().mockResolvedValue({}),
}));
//# sourceMappingURL=sharp.js.map