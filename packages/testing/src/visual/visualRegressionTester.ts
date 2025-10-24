/**
 * Visual Regression Testing System for PawfectMatch
 * Comprehensive visual testing with screenshot comparison and diff analysis
 */

import { promises as fs } from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import type { Page } from 'playwright';
import { PNG } from 'pngjs';

interface VisualTestConfig {
  threshold: number;
  pixelThreshold: number;
  fullPage: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  waitForSelector?: string;
  waitForTimeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

interface VisualTestResult {
  testName: string;
  passed: boolean;
  diffPercentage: number;
  diffPixels: number;
  baselinePath: string;
  actualPath: string;
  diffPath: string;
  error?: string;
  timestamp: string;
}

interface VisualTestSuite {
  name: string;
  tests: VisualTest[];
  config: VisualTestConfig;
}

interface VisualTest {
  name: string;
  url: string;
  selector?: string;
  config?: Partial<VisualTestConfig>;
}

interface DiffAnalysis {
  totalPixels: number;
  diffPixels: number;
  diffPercentage: number;
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    diffPixels: number;
  }>;
}

class VisualRegressionTester {
  private readonly baselineDir: string;
  private readonly actualDir: string;
  private readonly diffDir: string;
  private results: VisualTestResult[] = [];
  private readonly defaultConfig: VisualTestConfig = {
    threshold: 0.1,
    pixelThreshold: 0.1,
    fullPage: true,
    viewport: { width: 1280, height: 720 }
  };

  constructor(baseDir: string = './visual-tests') {
    this.baselineDir = path.join(baseDir, 'baselines');
    this.actualDir = path.join(baseDir, 'actual');
    this.diffDir = path.join(baseDir, 'diffs');
    this.initializeDirectories();
  }

  /**
   * Initialize test directories
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.baselineDir, { recursive: true });
      await fs.mkdir(this.actualDir, { recursive: true });
      await fs.mkdir(this.diffDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize test directories:', error);
    }
  }

  /**
   * Run visual regression test
   */
  public async runTest(
    page: Page,
    testName: string,
    config: Partial<VisualTestConfig> = {}
  ): Promise<VisualTestResult> {
    const testConfig = { ...this.defaultConfig, ...config };
    const timestamp = new Date().toISOString();
    
    try {
      // Set viewport if specified
      if (testConfig.viewport) {
        await page.setViewportSize(testConfig.viewport);
      }
      
      // Wait for selector or timeout if specified
      if (testConfig.waitForSelector) {
        await page.waitForSelector(testConfig.waitForSelector);
      } else if (testConfig.waitForTimeout) {
        await page.waitForTimeout(testConfig.waitForTimeout);
      }
      
      // Take screenshot
      const screenshot = await this.takeScreenshot(page, testConfig);
      
      // Compare with baseline
      const result = await this.compareScreenshots(testName, screenshot, testConfig);
      
      this.results.push(result);
      return result;
    } catch (error) {
      const errorResult: VisualTestResult = {
        testName,
        passed: false,
        diffPercentage: 0,
        diffPixels: 0,
        baselinePath: '',
        actualPath: '',
        diffPath: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      this.results.push(errorResult);
      return errorResult;
    }
  }

  /**
   * Take screenshot based on config
   */
  private async takeScreenshot(page: Page, config: VisualTestConfig): Promise<Buffer> {
    if (config.clip) {
      return await page.screenshot({
        clip: config.clip,
        type: 'png'
      });
    } else if (config.fullPage) {
      return await page.screenshot({
        fullPage: true,
        type: 'png'
      });
    } else {
      return await page.screenshot({
        type: 'png'
      });
    }
  }

  /**
   * Compare screenshots with baseline
   */
  private async compareScreenshots(
    testName: string,
    actualScreenshot: Buffer,
    config: VisualTestConfig
  ): Promise<VisualTestResult> {
    const baselinePath = path.join(this.baselineDir, `${testName}.png`);
    const actualPath = path.join(this.actualDir, `${testName}.png`);
    const diffPath = path.join(this.diffDir, `${testName}-diff.png`);
    
    // Save actual screenshot
    await fs.writeFile(actualPath, actualScreenshot);
    
    // Check if baseline exists
    let baselineExists = false;
    try {
      await fs.access(baselinePath);
      baselineExists = true;
    } catch {
      // Baseline doesn't exist, create it
      await fs.writeFile(baselinePath, actualScreenshot);
      return {
        testName,
        passed: true,
        diffPercentage: 0,
        diffPixels: 0,
        baselinePath,
        actualPath,
        diffPath,
        timestamp: new Date().toISOString()
      };
    }
    
    // Read baseline image
    const baselineBuffer = await fs.readFile(baselinePath);
    const baseline = PNG.sync.read(baselineBuffer);
    const actual = PNG.sync.read(actualScreenshot);
    
    // Ensure images have same dimensions
    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      return {
        testName,
        passed: false,
        diffPercentage: 100,
        diffPixels: baseline.width * baseline.height,
        baselinePath,
        actualPath,
        diffPath,
        error: 'Image dimensions do not match',
        timestamp: new Date().toISOString()
      };
    }
    
    // Create diff image
    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const diffPixels = pixelmatch(
      baseline.data,
      actual.data,
      diff.data,
      baseline.width,
      baseline.height,
      {
        threshold: config.pixelThreshold
      }
    );
    
    // Calculate diff percentage
    const totalPixels = baseline.width * baseline.height;
    const diffPercentage = (diffPixels / totalPixels) * 100;
    
    // Save diff image
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    
    // Determine if test passed
    const passed = diffPercentage <= config.threshold * 100;
    
    return {
      testName,
      passed,
      diffPercentage,
      diffPixels,
      baselinePath,
      actualPath,
      diffPath,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run visual test suite
   */
  public async runTestSuite(page: Page, suite: VisualTestSuite): Promise<VisualTestResult[]> {
    const results: VisualTestResult[] = [];
    
    for (const test of suite.tests) {
      const testConfig = { ...suite.config, ...test.config };
      
      try {
        // Navigate to test URL
        await page.goto(test.url);
        
        // Run the test
        const result = await this.runTest(page, test.name, testConfig);
        results.push(result);
        
        console.log(`Visual test "${test.name}": ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        const errorResult: VisualTestResult = {
          testName: test.name,
          passed: false,
          diffPercentage: 0,
          diffPixels: 0,
          baselinePath: '',
          actualPath: '',
          diffPath: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
        
        results.push(errorResult);
        console.error(`Visual test "${test.name}" failed:`, error);
      }
    }
    
    return results;
  }

  /**
   * Update baseline for a test
   */
  public async updateBaseline(testName: string): Promise<void> {
    const actualPath = path.join(this.actualDir, `${testName}.png`);
    const baselinePath = path.join(this.baselineDir, `${testName}.png`);
    
    try {
      await fs.copyFile(actualPath, baselinePath);
      console.log(`Baseline updated for test: ${testName}`);
    } catch (error) {
      console.error(`Failed to update baseline for test: ${testName}`, error);
    }
  }

  /**
   * Update all baselines
   */
  public async updateAllBaselines(): Promise<void> {
    try {
      const actualFiles = await fs.readdir(this.actualDir);
      
      for (const file of actualFiles) {
        if (file.endsWith('.png')) {
          const testName = path.basename(file, '.png');
          await this.updateBaseline(testName);
        }
      }
      
      console.log('All baselines updated');
    } catch (error) {
      console.error('Failed to update all baselines:', error);
    }
  }

  /**
   * Get diff analysis for a test
   */
  public async getDiffAnalysis(testName: string): Promise<DiffAnalysis | null> {
    const baselinePath = path.join(this.baselineDir, `${testName}.png`);
    const actualPath = path.join(this.actualDir, `${testName}.png`);
    const diffPath = path.join(this.diffDir, `${testName}-diff.png`);
    
    try {
      // Check if all files exist
      await fs.access(baselinePath);
      await fs.access(actualPath);
      await fs.access(diffPath);
      
      // Read images
      const baselineBuffer = await fs.readFile(baselinePath);
      const actualBuffer = await fs.readFile(actualPath);
      const diffBuffer = await fs.readFile(diffPath);
      
      const baseline = PNG.sync.read(baselineBuffer);
      const actual = PNG.sync.read(actualBuffer);
      const diff = PNG.sync.read(diffBuffer);
      
      // Calculate diff statistics
      const totalPixels = baseline.width * baseline.height;
      let diffPixels = 0;
      
      // Count diff pixels
      for (let i = 0; i < diff.data.length; i += 4) {
        if (diff.data[i] > 0 || diff.data[i + 1] > 0 || diff.data[i + 2] > 0) {
          diffPixels++;
        }
      }
      
      const diffPercentage = (diffPixels / totalPixels) * 100;
      
      // Find diff regions (simplified)
      const regions = this.findDiffRegions(diff, baseline.width, baseline.height);
      
      return {
        totalPixels,
        diffPixels,
        diffPercentage,
        regions
      };
    } catch (error) {
      console.error(`Failed to get diff analysis for test: ${testName}`, error);
      return null;
    }
  }

  /**
   * Find diff regions in image
   */
  private findDiffRegions(diff: PNG, width: number, height: number): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    diffPixels: number;
  }> {
    const regions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      diffPixels: number;
    }> = [];
    
    // Advanced region detection using computer vision algorithms
    const regions: Array<{ x: number; y: number; width: number; height: number; diffPixels: number }> = [];
    
    // Use flood fill algorithm for better region detection
    const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));
    
    const floodFill = (startX: number, startY: number): { x: number; y: number; width: number; height: number; diffPixels: number } => {
      const stack = [{ x: startX, y: startY }];
      let minX = startX, maxX = startX, minY = startY, maxY = startY;
      let diffPixels = 0;
      
      while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        
        if (x < 0 || x >= width || y < 0 || y >= height || visited[y][x]) continue;
        
        const index = (y * width + x) * 4;
        const isDiff = diff.data[index] > 0 || diff.data[index + 1] > 0 || diff.data[index + 2] > 0;
        
        if (!isDiff) continue;
        
        visited[y][x] = true;
        diffPixels++;
        
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        
        // Add neighboring pixels to stack
        stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
      }
      
      return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        diffPixels
      };
    };
    
    // Find all regions using flood fill
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y][x]) {
          const index = (y * width + x) * 4;
          const isDiff = diff.data[index] > 0 || diff.data[index + 1] > 0 || diff.data[index + 2] > 0;
          
          if (isDiff) {
            const region = floodFill(x, y);
            if (region.diffPixels > 10) { // Filter out noise
              regions.push(region);
            }
          }
        }
      }
    }
    
    return regions;
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
    };
    results: VisualTestResult[];
    timestamp: string;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    return {
      summary: {
        total,
        passed,
        failed,
        passRate
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all test results
   */
  public clearResults(): void {
    this.results = [];
  }

  /**
   * Get test results
   */
  public getResults(): VisualTestResult[] {
    return [...this.results];
  }

  /**
   * Export test results to JSON
   */
  public exportResults(filePath: string): Promise<void> {
    const report = this.generateReport();
    return fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Create visual test suite
   */
  public createTestSuite(name: string, tests: VisualTest[], config?: Partial<VisualTestConfig>): VisualTestSuite {
    return {
      name,
      tests,
      config: { ...this.defaultConfig, ...config }
    };
  }
}

export const visualRegressionTester = new VisualRegressionTester();
