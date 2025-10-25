export {};// Added to mark file as a module
const { jest } = require('@jest/globals');

const uploadToCloudinary = jest.fn(() => {
  return Promise.resolve({
    secure_url: 'https://res.cloudinary.com/demo/image/upload/mock_image.jpg',
    public_id: 'mock_public_id',
  });
});

const deleteFromCloudinary = jest.fn(() => {
  return Promise.resolve({ result: 'ok' });
});

module.exports = { uploadToCloudinary, deleteFromCloudinary };
