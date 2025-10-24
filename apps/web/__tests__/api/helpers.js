/**
 * Helper function to make API calls with proper base URL
 */
global.callApi = async (path, options = {}) => {
    return fetch(`${BASE_URL}${path}`, options);
};