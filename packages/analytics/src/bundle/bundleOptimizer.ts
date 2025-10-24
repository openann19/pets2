/**
 * Bundle Optimization System for PawfectMatch
 * Build-Time Static Bundle Analyzer
 *
 * This script should be executed in a Node.js environment after a webpack build
 * has completed and generated a stats file.
 *
 * @usage node ./scripts/BuildTimeBundleAnalyzer.js
 */

import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { gzipSizeFromFile } from 'gzip-size';
import * as path from 'path';
import { promisify } from 'util';

// Promisify the exec function for async/await syntax
const execAsync = promisify(exec);

// --- Type Definitions ---

// A more precise type for a module within a webpack stats chunk
interface WebpackModule {
  name: string;
  size: number;
  // Add other relevant properties from webpack stats if needed
}

// A more precise type for a chunk from a webpack stats file
interface WebpackChunk {
  id: string | number;
  names: string[];
  size: number;
  entry: boolean;
  initial: boolean;
  modules?: WebpackModule[];
}

interface BundleChunk {
  name: string;
  size: number;
  gzippedSize: number;
  modules: BundleModule[];
  isEntry: boolean;
}

interface BundleModule {
  name: string;
  size: number;
}

interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  chunks: BundleChunk[];
  duplicates: Array<{
    name: string;
    chunks: string[];
    totalSize: number;
  }>;
  recommendations: BundleRecommendation[];
  optimizationScore: number;
}

interface BundleRecommendation {
  type: 'code-splitting' | 'tree-shaking' | 'compression' | 'duplicates' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

interface OptimizationConfig {
  maxTotalGzippedSize: number; // 250 KB
  maxChunkGzippedSize: number; // 100 KB
  maxModuleSize: number;       // 50 KB
  reportPath: string;
  statsFilePath: string;
  buildDirectory: string;
}

/**
 * Performs deep static analysis of webpack build artifacts.
 */
export class BuildTimeBundleAnalyzer {
  private readonly config: OptimizationConfig;

  constructor(config?: Partial<OptimizationConfig>) {
    this.config = {
      maxTotalGzippedSize: 250 * 1024,
      maxChunkGzippedSize: 100 * 1024,
      maxModuleSize: 50 * 1024,
      buildDirectory: path.join(process.cwd(), 'dist'),
      statsFilePath: path.join(process.cwd(), 'dist', 'webpack-stats.json'),
      reportPath: path.join(process.cwd(), 'dist', 'bundle-analysis.json'),
      ...config,
    };
    console.log('BuildTimeBundleAnalyzer initialized with config:', this.config);
  }

  /**
   * Formats a size in bytes into a human-readable string (KB, MB).
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Reads and parses the webpack stats JSON file.
   * @throws {Error} If the stats file cannot be found or parsed.
   */
  private async getWebpackStats(): Promise<{ chunks: WebpackChunk[] }> {
    try {
      const statsContent = await fs.readFile(this.config.statsFilePath, 'utf-8');
      return JSON.parse(statsContent);
    } catch (error) {
      console.error(`❌ Failed to read or parse webpack stats file at: ${this.config.statsFilePath}`);
      throw new Error('Webpack stats file is missing or invalid. Please ensure your build process generates this file.');
    }
  }

  /**
   * Analyzes the build artifacts based on the webpack stats file.
   * @returns {Promise<BundleAnalysis>} A detailed analysis report.
   */
  public async analyze(): Promise<BundleAnalysis> {
    console.log('🚀 Starting bundle analysis...');
    const stats = await this.getWebpackStats();
    if (!stats.chunks || stats.chunks.length === 0) {
      throw new Error('No chunks found in webpack stats file.');
    }

    const chunks: BundleChunk[] = await this.processChunks(stats.chunks);
    const duplicates = this.findDuplicateModules(chunks);
    const recommendations = this.generateRecommendations(chunks, duplicates);
    const optimizationScore = this.calculateOptimizationScore(chunks, duplicates);

    const analysis: BundleAnalysis = {
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      totalGzippedSize: chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0),
      chunks,
      duplicates,
      recommendations,
      optimizationScore
    };

    console.log(`✅ Bundle analysis complete. Optimization Score: ${optimizationScore}/100`);
    return analysis;
  }

  /**
   * Processes webpack chunks to enrich them with gzipped size and module info.
   */
  private async processChunks(webpackChunks: WebpackChunk[]): Promise<BundleChunk[]> {
    const processedChunks: BundleChunk[] = [];
    for (const chunk of webpackChunks) {
      const chunkName = chunk.names.join(', ') || `chunk-${chunk.id}`;
      // Assuming chunk files are named like `[name].[hash].js` or are found in assets
      // A more robust implementation might map chunk IDs to output files from stats.
      const chunkFileName = `${chunk.names[0]}.js`; // Simplification
      const filePath = path.join(this.config.buildDirectory, chunkFileName);

      let gzippedSize = 0;
      try {
        gzippedSize = await gzipSizeFromFile(filePath);
      } catch {
        console.warn(`Could not find or calculate gzip size for ${filePath}. Defaulting to 0.`);
      }

      const modules: BundleModule[] = (chunk.modules || []).map(m => ({
        name: m.name,
        size: m.size,
      }));

      processedChunks.push({
        name: chunkName,
        size: chunk.size,
        gzippedSize,
        modules,
        isEntry: chunk.entry && chunk.initial,
      });
    }
    return processedChunks;
  }


  /**
   * Finds modules that are included in more than one chunk.
   */
  private findDuplicateModules(chunks: BundleChunk[]): BundleAnalysis['duplicates'] {
    const moduleMap = new Map<string, { chunks: string[]; size: number }>();

    for (const chunk of chunks) {
      for (const module of chunk.modules) {
        if (!moduleMap.has(module.name)) {
          moduleMap.set(module.name, { chunks: [], size: module.size });
        }
        moduleMap.get(module.name)!.chunks.push(chunk.name);
      }
    }

    const duplicates: BundleAnalysis['duplicates'] = [];
    moduleMap.forEach((data, name) => {
      if (data.chunks.length > 1) {
        duplicates.push({
          name,
          chunks: data.chunks,
          totalSize: data.size * data.chunks.length,
        });
      }
    });

    return duplicates;
  }

  /**
   * Generates actionable optimization recommendations from the analysis.
   */
  private generateRecommendations(chunks: BundleChunk[], duplicates: BundleAnalysis['duplicates']): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];
    const totalGzippedSize = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

    // 1. Total Bundle Size Recommendation
    if (totalGzippedSize > this.config.maxTotalGzippedSize) {
      recommendations.push({
        type: 'code-splitting', priority: 'high', title: 'Total Bundle Size Exceeds Target',
        description: `Total gzipped size is ${this.formatSize(totalGzippedSize)}, exceeding the recommended max of ${this.formatSize(this.config.maxTotalGzippedSize)}.`,
        impact: 'High - Significantly affects initial page load time and user experience.',
        effort: 'high',
        implementation: 'Review and apply code-splitting strategies for routes and large components. Analyze dependencies for smaller alternatives.'
      });
    }

    // 2. Large Chunk Recommendations
    chunks.forEach(chunk => {
      if (chunk.gzippedSize > this.config.maxChunkGzippedSize) {
        recommendations.push({
          type: 'code-splitting', priority: 'medium', title: `Large Chunk Detected: ${chunk.name}`,
          description: `Chunk '${chunk.name}' has a gzipped size of ${this.formatSize(chunk.gzippedSize)}, exceeding the threshold of ${this.formatSize(this.config.maxChunkGzippedSize)}.`,
          impact: 'Medium - This chunk can slow down specific parts of the application or initial load if it is an entry chunk.',
          effort: 'medium',
          implementation: `Investigate the contents of '${chunk.name}'. Consider splitting vendor libraries or using dynamic imports for components within this chunk.`
        });
      }
    });

    // 3. Duplicate Module Recommendations
    duplicates.forEach(dup => {
      recommendations.push({
        type: 'duplicates', priority: 'high', title: `Duplicate Module Found: ${dup.name}`,
        description: `The module '${dup.name}' is included in ${dup.chunks.length} different chunks: ${dup.chunks.join(', ')}.`,
        impact: 'High - Duplication unnecessarily inflates bundle size, leading to longer download times.',
        effort: 'low',
        implementation: 'Configure webpack\'s `optimization.splitChunks.cacheGroups` to move this shared module into its own chunk.'
      });
    });

    return recommendations;
  }

  /**
   * Calculates a holistic optimization score from 0 to 100.
   */
  private calculateOptimizationScore(chunks: BundleChunk[], duplicates: BundleAnalysis['duplicates']): number {
    let score = 100;
    const totalGzippedSize = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

    // Penalize for exceeding total size limit
    if (totalGzippedSize > this.config.maxTotalGzippedSize) {
      score -= 30 * Math.min(1, (totalGzippedSize - this.config.maxTotalGzippedSize) / this.config.maxTotalGzippedSize);
    }

    // Penalize for each large chunk
    chunks.forEach(chunk => {
      if (chunk.gzippedSize > this.config.maxChunkGzippedSize) {
        score -= 15;
      }
    });

    // Penalize for each duplicate module
    score -= duplicates.length * 10;

    return Math.max(0, Math.round(score));
  }

  /**
   * Runs the full analysis and saves the report to a JSON file.
   */
  public async runAndSaveReport(): Promise<void> {
    try {
      const analysis = await this.analyze();
      const report = {
        generatedAt: new Date().toISOString(),
        config: this.config,
        analysis,
      };
      await fs.writeFile(this.config.reportPath, JSON.stringify(report, null, 2));
      console.log(`✅ Analysis report saved successfully to: ${this.config.reportPath}`);
    } catch (error) {
      console.error('❌ An error occurred during the analysis process:', error);
      process.exit(1); // Exit with error code
    }
  }

  /**
   * Attempts to run an optimization build script defined in package.json.
   */
  public async triggerOptimizationBuild(): Promise<void> {
    console.log('🚀 Attempting to trigger optimization build...');
    try {
      const { stdout } = await execAsync('npm run build:optimize');
      console.log('Optimization build command output:', stdout);
      console.log('✅ Optimization build completed. Re-run analysis to see improvements.');
    } catch (error) {
      console.error('❌ Optimization build script failed:', error);
    }
  }
}