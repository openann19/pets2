/**
 * Integration Testing System for PawfectMatch
 * Comprehensive API and end-to-end testing framework
 */

import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { Page } from 'playwright';

interface APITest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  expectedStatus: number;
  expectedResponse?: unknown;
  validateResponse?: (response: AxiosResponse) => boolean;
}

interface E2ETest {
  name: string;
  steps: E2EStep[];
  expectedOutcome: string;
  timeout?: number;
}

interface E2EStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'assert' | 'screenshot';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  expectedText?: string;
  expectedUrl?: string;
  screenshotName?: string;
}

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: unknown;
  timestamp: string;
}

interface TestSuite {
  name: string;
  tests: (APITest | E2ETest)[];
  config?: {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
  };
}

class IntegrationTester {
  private results: TestResult[] = [];
  private baseUrl: string;
  private defaultTimeout: number = 30000;
  private defaultRetries: number = 3;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Run API test
   */
  public async runAPITest(test: APITest): Promise<TestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    try {
      // Prepare request
      const config = {
        method: test.method,
        url: `${this.baseUrl}${test.url}`,
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        },
        data: test.body,
        timeout: this.defaultTimeout
      };
      
      // Make request
      const response = await axios(config);
      
      // Validate status
      if (response.status !== test.expectedStatus) {
        throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
      }
      
      // Validate response if provided
      if (test.expectedResponse) {
        this.validateResponse(response.data, test.expectedResponse);
      }
      
      // Custom validation if provided
      if (test.validateResponse && !test.validateResponse(response)) {
        throw new Error('Custom validation failed');
      }
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        testName: test.name,
        passed: true,
        duration,
        details: {
          status: response.status,
          responseData: response.data
        },
        timestamp
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        testName: test.name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      this.results.push(result);
      return result;
    }
  }

  /**
   * Run E2E test
   */
  public async runE2ETest(page: Page, test: E2ETest): Promise<TestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    try {
      for (const step of test.steps) {
        await this.executeStep(page, step);
      }
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        testName: test.name,
        passed: true,
        duration,
        details: {
          expectedOutcome: test.expectedOutcome
        },
        timestamp
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        testName: test.name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      this.results.push(result);
      return result;
    }
  }

  /**
   * Execute E2E step
   */
  private async executeStep(page: Page, step: E2EStep): Promise<void> {
    const timeout = step.timeout || this.defaultTimeout;
    
    switch (step.action) {
      case 'navigate':
        if (!step.url) {
          throw new Error('URL required for navigate step');
        }
        await page.goto(`${this.baseUrl}${step.url}`, { timeout });
        break;
        
      case 'click':
        if (!step.selector) {
          throw new Error('Selector required for click step');
        }
        await page.click(step.selector, { timeout });
        break;
        
      case 'type':
        if (!step.selector || !step.value) {
          throw new Error('Selector and value required for type step');
        }
        await page.fill(step.selector, step.value, { timeout });
        break;
        
      case 'wait':
        if (step.selector) {
          await page.waitForSelector(step.selector, { timeout });
        } else if (step.timeout) {
          await page.waitForTimeout(step.timeout);
        } else {
          throw new Error('Selector or timeout required for wait step');
        }
        break;
        
      case 'assert':
        if (step.expectedText) {
          if (!step.selector) {
            throw new Error('Selector required for text assertion');
          }
          const text = await page.textContent(step.selector);
          if (text !== step.expectedText) {
            throw new Error(`Expected text "${step.expectedText}", got "${text}"`);
          }
        }
        
        if (step.expectedUrl) {
          const currentUrl = page.url();
          if (!currentUrl.includes(step.expectedUrl)) {
            throw new Error(`Expected URL to contain "${step.expectedUrl}", got "${currentUrl}"`);
          }
        }
        break;
        
      case 'screenshot':
        if (!step.screenshotName) {
          throw new Error('Screenshot name required for screenshot step');
        }
        await page.screenshot({ path: `screenshots/${step.screenshotName}.png` });
        break;
        
      default:
        throw new Error(`Unknown step action: ${step.action}`);
    }
  }

  /**
   * Validate response data
   */
  private validateResponse(actual: unknown, expected: unknown): void {
    if (typeof expected === 'object' && expected !== null) {
      for (const key in expected) {
        if (!(key in actual)) {
          throw new Error(`Missing property: ${key}`);
        }
        
        if (typeof expected[key] === 'object' && expected[key] !== null) {
          this.validateResponse(actual[key], expected[key]);
        } else if (actual[key] !== expected[key]) {
          throw new Error(`Property ${key} mismatch: expected ${expected[key]}, got ${actual[key]}`);
        }
      }
    } else if (actual !== expected) {
      throw new Error(`Value mismatch: expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Run test suite
   */
  public async runTestSuite(page: Page, suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const config = {
      baseUrl: suite.config?.baseUrl || this.baseUrl,
      timeout: suite.config?.timeout || this.defaultTimeout,
      retries: suite.config?.retries || this.defaultRetries
    };
    
    for (const test of suite.tests) {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < config.retries; attempt++) {
        try {
          let result: TestResult;
          
          if ('steps' in test) {
            // E2E test
            result = await this.runE2ETest(page, test);
          } else {
            // API test
            result = await this.runAPITest(test);
          }
          
          results.push(result);
          console.log(`Test "${test.name}": ${result.passed ? 'PASSED' : 'FAILED'}`);
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          if (attempt === config.retries - 1) {
            const result: TestResult = {
              testName: test.name,
              passed: false,
              duration: 0,
              error: lastError.message,
              timestamp: new Date().toISOString()
            };
            
            results.push(result);
            console.error(`Test "${test.name}" failed after ${config.retries} attempts:`, lastError);
          } else {
            console.warn(`Test "${test.name}" failed, retrying... (attempt ${attempt + 1}/${config.retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Create API test
   */
  public createAPITest(
    name: string,
    method: APITest['method'],
    url: string,
    expectedStatus: number,
    options: Partial<APITest> = {}
  ): APITest {
    return {
      name,
      method,
      url,
      expectedStatus,
      ...options
    };
  }

  /**
   * Create E2E test
   */
  public createE2ETest(
    name: string,
    steps: E2EStep[],
    expectedOutcome: string,
    options: Partial<E2ETest> = {}
  ): E2ETest {
    return {
      name,
      steps,
      expectedOutcome,
      ...options
    };
  }

  /**
   * Create test suite
   */
  public createTestSuite(
    name: string,
    tests: (APITest | E2ETest)[],
    config?: TestSuite['config']
  ): TestSuite {
    return {
      name,
      tests,
      config
    };
  }

  /**
   * Generate test report
   */
  public generateReport(): {
    summary: {
      total: number;
      passed: number;
      failed: number;
      passRate: number;
      averageDuration: number;
    };
    results: TestResult[];
    timestamp: string;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const averageDuration = total > 0 ? this.results.reduce((sum, r) => sum + r.duration, 0) / total : 0;
    
    return {
      summary: {
        total,
        passed,
        failed,
        passRate,
        averageDuration
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear test results
   */
  public clearResults(): void {
    this.results = [];
  }

  /**
   * Get test results
   */
  public getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Export test results
   */
  public async exportResults(filePath: string): Promise<void> {
    const report = this.generateReport();
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Set base URL
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Set default timeout
   */
  public setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Set default retries
   */
  public setRetries(retries: number): void {
    this.defaultRetries = retries;
  }
}

export const integrationTester = new IntegrationTester();
