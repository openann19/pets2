/**
 * Main Jest setup file
 * Loads modular setup files conditionally based on test needs
 */

// Always load core setup
import './jest.setup.core';

// Load all mocks - modular files handle conditional logic internally
// Using require to ensure proper load order
require('./jest.setup.mocks.native');
require('./jest.setup.mocks.expo');
require('./jest.setup.mocks.navigation');
require('./jest.setup.mocks.external');
