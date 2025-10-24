/**
 * Real Playwright Test Runner for PawfectMatch
 * Comprehensive browser automation and testing
 */

import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium, firefox, webkit } from 'playwright';
import { visualRegressionTester } from '../visual/visualRegressionTester';
import { integrationTester } from '../integration/integrationTester';

interface TestConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport: { width: number; height: number };
  timeout: number;
  baseUrl: string;
  screenshotDir: string;
  videoDir: string;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  config?: Partial<TestConfig>;
}

interface TestCase {
  name: string;
  type: 'visual' | 'e2e' | 'api' | 'performance';
  steps: TestStep[];
  expectedOutcome: string;
  timeout?: number;
}

interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'assert' | 'screenshot' | 'scroll' | 'hover' | 'select' | 'upload' | 'download';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  expectedText?: string;
  expectedUrl?: string;
  screenshotName?: string;
  filePath?: string;
  options?: string;
}

interface TestResult {
  testName: string;
  suiteName: string;
  type: string;
  passed: boolean;
  duration: number;
  error?: string;
  screenshots: string[];
  videos?: string[];
  performance?: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  timestamp: string;
}

class PlaywrightTestRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private defaultConfig: TestConfig = {
    browser: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    baseUrl: 'http://localhost:3000',
    screenshotDir: './test-results/screenshots',
    videoDir: './test-results/videos'
  };

  constructor() {
    this.initializeTestRunner();
  }

  /**
   * Initialize test runner
   */
  private async initializeTestRunner(): Promise<void> {
    try {
      await this.setupDirectories();
      console.log('Playwright test runner initialized');
    } catch (error) {
      console.error('Failed to initialize Playwright test runner:', error);
    }
  }

  /**
   * Setup test directories
   */
  private async setupDirectories(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      await fs.mkdir(this.defaultConfig.screenshotDir, { recursive: true });
      await fs.mkdir(this.defaultConfig.videoDir, { recursive: true });
    } catch (error) {
      console.error('Failed to setup test directories:', error);
    }
  }

  /**
   * Launch browser
   */
  public async launchBrowser(config: Partial<TestConfig> = {}): Promise<void> {
    const testConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Select browser
      let browserType;
      switch (testConfig.browser) {
        case 'firefox':
          browserType = firefox;
          break;
        case 'webkit':
          browserType = webkit;
          break;
        default:
          browserType = chromium;
      }
      
      // Launch browser
      this.browser = await browserType.launch({
        headless: testConfig.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      // Create context
      this.context = await this.browser.newContext({
        viewport: testConfig.viewport,
        recordVideo: {
          dir: testConfig.videoDir,
          size: testConfig.viewport
        }
      });
      
      // Create page
      this.page = await this.context.newPage();
      
      // Set default timeout
      this.page.setDefaultTimeout(testConfig.timeout);
      
      console.log(`Browser launched: ${testConfig.browser}`);
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  }

  /**
   * Close browser
   */
  public async closeBrowser(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('Browser closed');
    } catch (error) {
      console.error('Failed to close browser:', error);
    }
  }

  /**
   * Run test suite
   */
  public async runTestSuite(suite: TestSuite): Promise<TestResult[]> {
    if (!this.page) {
      throw new Error('Browser not launched. Call launchBrowser() first.');
    }
    
    const results: TestResult[] = [];
    const config = { ...this.defaultConfig, ...suite.config };
    
    console.log(`Running test suite: ${suite.name}`);
    
    for (const test of suite.tests) {
      try {
        const result = await this.runTest(this.page, suite.name, test, config);
        results.push(result);
        
        console.log(`Test "${test.name}": ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        const errorResult: TestResult = {
          testName: test.name,
          suiteName: suite.name,
          type: test.type,
          passed: false,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          screenshots: [],
          timestamp: new Date().toISOString()
        };
        
        results.push(errorResult);
        console.error(`Test "${test.name}" failed:`, error);
      }
    }
    
    this.results.push(...results);
    return results;
  }

  /**
   * Run individual test
   */
  private async runTest(
    page: Page,
    suiteName: string,
    test: TestCase,
    config: TestConfig
  ): Promise<TestResult> {
    const startTime = Date.now();
    const screenshots: string[] = [];
    
    try {
      // Measure performance
      const performance = await this.measurePerformance(page);
      
      // Execute test steps
      for (const step of test.steps) {
        await this.executeStep(page, step, config, screenshots);
      }
      
      const duration = Date.now() - startTime;
      
      return {
        testName: test.name,
        suiteName,
        type: test.type,
        passed: true,
        duration,
        screenshots,
        performance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        testName: test.name,
        suiteName,
        type: test.type,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshots,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute test step
   */
  private async executeStep(
    page: Page,
    step: TestStep,
    config: TestConfig,
    screenshots: string[]
  ): Promise<void> {
    const timeout = step.timeout || config.timeout;
    
    switch (step.action) {
      case 'navigate':
        if (!step.url) {
          throw new Error('URL required for navigate step');
        }
        await page.goto(`${config.baseUrl}${step.url}`, { timeout });
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
        const screenshotPath = `${config.screenshotDir}/${step.screenshotName}.png`;
        await page.screenshot({ path: screenshotPath });
        screenshots.push(screenshotPath);
        break;
        
      case 'scroll':
        if (step.selector) {
          await page.locator(step.selector).scrollIntoViewIfNeeded();
        } else {
          await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
        }
        break;
        
      case 'hover':
        if (!step.selector) {
          throw new Error('Selector required for hover step');
        }
        await page.hover(step.selector, { timeout });
        break;
        
      case 'select':
        if (!step.selector || !step.value) {
          throw new Error('Selector and value required for select step');
        }
        await page.selectOption(step.selector, step.value, { timeout });
        break;
        
      case 'upload':
        if (!step.selector || !step.filePath) {
          throw new Error('Selector and file path required for upload step');
        }
        await page.setInputFiles(step.selector, step.filePath, { timeout });
        break;
        
      case 'download':
        const downloadPromise = page.waitForEvent('download');
        await page.click(step.selector!, { timeout });
        const download = await downloadPromise;
        const downloadPath = `${config.screenshotDir}/${download.suggestedFilename()}`;
        await download.saveAs(downloadPath);
        break;
        
      default:
        throw new Error(`Unknown step action: ${step.action}`);
    }
  }

  /**
   * Measure page performance
   */
  private async measurePerformance(page: Page): Promise<TestResult['performance']> {
    try {
      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const layoutShift = performance.getEntriesByType('layout-shift');
        const firstInput = performance.getEntriesByType('first-input');
        
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0, // Would need to be measured differently
          cumulativeLayoutShift: layoutShift.reduce((sum, entry: unknown) => sum + entry.value, 0),
          firstInputDelay: firstInput.length > 0 ? (firstInput[0] as unknown).processingStart - (firstInput[0] as unknown).startTime : 0
        };
      });
      
      return metrics;
    } catch (error) {
      console.error('Failed to measure performance:', error);
      return undefined;
    }
  }

  /**
   * Run visual regression test
   */
  public async runVisualTest(testName: string, config: Partial<TestConfig> = {}): Promise<TestResult> {
    if (!this.page) {
      throw new Error('Browser not launched. Call launchBrowser() first.');
    }
    
    const testConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    
    try {
      // Use visual regression tester
      const visualResult = await visualRegressionTester.runTest(this.page, testName, {
        threshold: 0.1,
        pixelThreshold: 0.1,
        fullPage: true,
        viewport: testConfig.viewport
      });
      
      const duration = Date.now() - startTime;
      
      return {
        testName,
        suiteName: 'visual',
        type: 'visual',
        passed: visualResult.passed,
        duration,
        error: visualResult.error,
        screenshots: [visualResult.actualPath, visualResult.diffPath],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        testName,
        suiteName: 'visual',
        type: 'visual',
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshots: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run API test
   */
  public async runAPITest(testName: string, apiTest: unknown): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await integrationTester.runAPITest(apiTest);
      
      return {
        testName,
        suiteName: 'api',
        type: 'api',
        passed: result.passed,
        duration: result.duration,
        error: result.error,
        screenshots: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        testName,
        suiteName: 'api',
        type: 'api',
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshots: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create test suite
   */
  public createTestSuite(
    name: string,
    tests: TestCase[],
    config?: Partial<TestConfig>
  ): TestSuite {
    return {
      name,
      tests,
      config
    };
  }

  /**
   * Create test case
   */
  public createTestCase(
    name: string,
    type: TestCase['type'],
    steps: TestStep[],
    expectedOutcome: string,
    options: Partial<TestCase> = {}
  ): TestCase {
    return {
      name,
      type,
      steps,
      expectedOutcome,
      ...options
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
      byType: Record<string, { total: number; passed: number; failed: number }>;
    };
    results: TestResult[];
    timestamp: string;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const averageDuration = total > 0 ? this.results.reduce((sum, r) => sum + r.duration, 0) / total : 0;
    
    // Group by type
    const byType = this.results.reduce<Record<string, { total: number; passed: number; failed: number }>>((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = { total: 0, passed: 0, failed: 0 };
      }
      acc[result.type].total++;
      if (result.passed) {
        acc[result.type].passed++;
      } else {
        acc[result.type].failed++;
      }
      return acc;
    }, {});
    
    return {
      summary: {
        total,
        passed,
        failed,
        passRate,
        averageDuration,
        byType
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
   * Set default config
   */
  public setDefaultConfig(config: Partial<TestConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get default config
   */
  public getDefaultConfig(): TestConfig {
    return { ...this.defaultConfig };
  }
}

export const playwrightTestRunner = new PlaywrightTestRunner();
