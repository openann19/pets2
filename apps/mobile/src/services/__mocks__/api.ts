export const request = jest.fn();

export const api = {
	request,
	get: jest.fn(),
	post: jest.fn(),
	presignPhoto: jest.fn(),
	presignVoice: jest.fn(),
};

export default { api, request };
