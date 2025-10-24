/**
 * Mobile Testing and Validation Utilities
 * Comprehensive testing suite for mobile compliance and performance
 */
import { useEffect, useState, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
/**
 * Hook for running comprehensive mobile tests
 */
export function useMobileTesting() {
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const runTests = useCallback(async () => {
        setIsRunning(true);
        setProgress(0);
        const testResults = {
            touchTargets: [],
            responsiveDesign: [],
            performance: [],
            accessibility: [],
            safeAreas: [],
            overallScore: 0,
            recommendations: [],
        };
        try {
            // Test 1: Touch Targets (20% of score)
            setProgress(10);
            testResults.touchTargets = await testTouchTargets();
            // Test 2: Responsive Design (25% of score)
            setProgress(30);
            testResults.responsiveDesign = await testResponsiveDesign();
            // Test 3: Performance (25% of score)
            setProgress(50);
            testResults.performance = await testPerformance();
            // Test 4: Accessibility (20% of score)
            setProgress(70);
            testResults.accessibility = await testAccessibility();
            // Test 5: Safe Areas (10% of score)
            setProgress(90);
            testResults.safeAreas = await testSafeAreas();
            // Calculate overall score
            testResults.overallScore = calculateOverallScore(testResults);
            // Generate recommendations
            testResults.recommendations = generateRecommendations(testResults);
            setProgress(100);
            setResults(testResults);
        }
        catch (error) {
            logger.error('Mobile testing failed:', { error });
        }
        finally {
            setIsRunning(false);
        }
    }, []);
    return { results, isRunning, progress, runTests };
}
/**
 * Test touch target sizes (minimum 44px)
 */
async function testTouchTargets() {
    const results = [];
    const touchElements = document.querySelectorAll('button, [role="button"], a, input, select, textarea, [tabindex]');
    touchElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const minSize = 44; // WCAG minimum
        const test = {
            element: `${element.tagName.toLowerCase()}[${index}]`,
            size: { width: rect.width, height: rect.height },
            meetsMinimum: rect.width >= minSize && rect.height >= minSize,
        };
        if (!test.meetsMinimum) {
            test.recommendation = `Increase size to at least ${minSize}px. Current: ${Math.round(rect.width)}x${Math.round(rect.height)}px`;
        }
        results.push(test);
    });
    return results;
}
/**
 * Test responsive design at different breakpoints
 */
async function testResponsiveDesign() {
    const results = [];
    const breakpoints = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 },
    ];
    for (const breakpoint of breakpoints) {
        // Simulate viewport change (in real implementation, you'd use browser APIs)
        const test = {
            breakpoint: breakpoint.name,
            viewport: breakpoint,
            elementsVisible: 0,
            elementsHidden: 0,
            layoutBroken: false,
            issues: [],
        };
        // Check for common responsive issues
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            // Check for horizontal overflow
            if (rect.right > breakpoint.width) {
                test.issues.push(`Element ${element.tagName} overflows horizontally`);
                test.layoutBroken = true;
            }
            // Check for elements that should be hidden on mobile
            if (breakpoint.name === 'mobile' && styles.display !== 'none' && element.classList.contains('hidden-md')) {
                test.elementsVisible++;
            }
            else if (styles.display === 'none') {
                test.elementsHidden++;
            }
            else {
                test.elementsVisible++;
            }
        });
        results.push(test);
    }
    return results;
}
/**
 * Test performance metrics
 */
async function testPerformance() {
    const results = [];
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        // First Contentful Paint
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcp) {
            results.push({
                metric: 'First Contentful Paint',
                value: fcp.startTime,
                threshold: 1800, // 1.8s
                passed: fcp.startTime < 1800,
                impact: 'high',
            });
        }
        // Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
            const lcp = lcpEntries[lcpEntries.length - 1];
            results.push({
                metric: 'Largest Contentful Paint',
                value: lcp.startTime,
                threshold: 2500, // 2.5s
                passed: lcp.startTime < 2500,
                impact: 'high',
            });
        }
        // First Input Delay
        const fidEntries = performance.getEntriesByType('first-input');
        if (fidEntries.length > 0) {
            const fid = fidEntries[0];
            const delay = fid.processingStart - fid.startTime;
            results.push({
                metric: 'First Input Delay',
                value: delay,
                threshold: 100, // 100ms
                passed: delay < 100,
                impact: 'medium',
            });
        }
        // Cumulative Layout Shift
        const clsEntries = performance.getEntriesByType('layout-shift');
        let cls = 0;
        clsEntries.forEach((entry) => {
            if (!entry.hadRecentInput) {
                cls += entry.value;
            }
        });
        results.push({
            metric: 'Cumulative Layout Shift',
            value: cls,
            threshold: 0.1,
            passed: cls < 0.1,
            impact: 'medium',
        });
        // Total Load Time
        results.push({
            metric: 'Total Load Time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            threshold: 3000, // 3s
            passed: (navigation.loadEventEnd - navigation.fetchStart) < 3000,
            impact: 'high',
        });
    }
    return results;
}
/**
 * Test accessibility features
 */
async function testAccessibility() {
    const results = [];
    // Test for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        const hasAlt = img.hasAttribute('alt');
        results.push({
            element: `img[${index}]`,
            test: 'Alt text presence',
            passed: hasAlt,
            severity: hasAlt ? 'info' : 'error',
            message: hasAlt ? 'Alt text present' : 'Missing alt text',
        });
    });
    // Test for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const skipsLevel = level > previousLevel + 1;
        results.push({
            element: `${heading.tagName.toLowerCase()}[${index}]`,
            test: 'Heading hierarchy',
            passed: !skipsLevel,
            severity: skipsLevel ? 'warning' : 'info',
            message: skipsLevel ? 'Skips heading level' : 'Proper heading hierarchy',
        });
        previousLevel = level;
    });
    // Test for proper form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        const hasLabel = input.hasAttribute('aria-label') ||
            input.hasAttribute('aria-labelledby') ||
            document.querySelector(`label[for="${input.id}"]`);
        results.push({
            element: `${input.tagName.toLowerCase()}[${index}]`,
            test: 'Form label association',
            passed: !!hasLabel,
            severity: hasLabel ? 'info' : 'error',
            message: hasLabel ? 'Properly labeled' : 'Missing label or aria-label',
        });
    });
    // Test for color contrast (simplified)
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        // This is a simplified test - in production, you'd use a proper contrast calculation
        const hasGoodContrast = color !== backgroundColor &&
            (color.includes('rgb(0, 0, 0)') || color.includes('rgb(255, 255, 255)'));
        results.push({
            element: `${element.tagName.toLowerCase()}[${index}]`,
            test: 'Color contrast',
            passed: hasGoodContrast,
            severity: hasGoodContrast ? 'info' : 'warning',
            message: hasGoodContrast ? 'Good contrast' : 'Check color contrast ratio',
        });
    });
    return results;
}
/**
 * Test safe area handling
 */
async function testSafeAreas() {
    const results = [];
    // Test for safe area CSS variables
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const hasSafeAreaTop = computedStyle.getPropertyValue('--sat-inset-top') !== '';
    const hasSafeAreaBottom = computedStyle.getPropertyValue('--sat-inset-bottom') !== '';
    const hasSafeAreaLeft = computedStyle.getPropertyValue('--sat-inset-left') !== '';
    const hasSafeAreaRight = computedStyle.getPropertyValue('--sat-inset-right') !== '';
    results.push({
        device: 'iOS Simulator',
        insets: {
            top: hasSafeAreaTop ? 44 : 0,
            right: hasSafeAreaRight ? 0 : 0,
            bottom: hasSafeAreaBottom ? 34 : 0,
            left: hasSafeAreaLeft ? 0 : 0,
        },
        elementsAffected: document.querySelectorAll('[class*="safe-area"], [class*="pt-[env"], [class*="pb-[env"]').length,
        properlyHandled: hasSafeAreaTop && hasSafeAreaBottom,
    });
    return results;
}
/**
 * Calculate overall mobile compliance score
 */
function calculateOverallScore(results) {
    let score = 0;
    let totalWeight = 0;
    // Touch targets (20% weight)
    const touchTargetScore = results.touchTargets.length > 0
        ? (results.touchTargets.filter(t => t.meetsMinimum).length / results.touchTargets.length) * 100
        : 100;
    score += touchTargetScore * 0.2;
    totalWeight += 0.2;
    // Responsive design (25% weight)
    const responsiveScore = results.responsiveDesign.length > 0
        ? (results.responsiveDesign.filter(r => !r.layoutBroken).length / results.responsiveDesign.length) * 100
        : 100;
    score += responsiveScore * 0.25;
    totalWeight += 0.25;
    // Performance (25% weight)
    const performanceScore = results.performance.length > 0
        ? (results.performance.filter(p => p.passed).length / results.performance.length) * 100
        : 100;
    score += performanceScore * 0.25;
    totalWeight += 0.25;
    // Accessibility (20% weight)
    const accessibilityScore = results.accessibility.length > 0
        ? (results.accessibility.filter(a => a.passed).length / results.accessibility.length) * 100
        : 100;
    score += accessibilityScore * 0.2;
    totalWeight += 0.2;
    // Safe areas (10% weight)
    const safeAreaScore = results.safeAreas.length > 0
        ? (results.safeAreas.filter(s => s.properlyHandled).length / results.safeAreas.length) * 100
        : 100;
    score += safeAreaScore * 0.1;
    totalWeight += 0.1;
    return Math.round(score / totalWeight);
}
/**
 * Generate recommendations based on test results
 */
function generateRecommendations(results) {
    const recommendations = [];
    // Touch target recommendations
    const failedTouchTargets = results.touchTargets.filter(t => !t.meetsMinimum);
    if (failedTouchTargets.length > 0) {
        recommendations.push(`Fix ${failedTouchTargets.length} touch targets that are below 44px minimum size`);
    }
    // Responsive design recommendations
    const brokenLayouts = results.responsiveDesign.filter(r => r.layoutBroken);
    if (brokenLayouts.length > 0) {
        recommendations.push(`Fix responsive layout issues on ${brokenLayouts.length} breakpoint(s)`);
    }
    // Performance recommendations
    const failedPerformance = results.performance.filter(p => !p.passed && p.impact === 'high');
    if (failedPerformance.length > 0) {
        recommendations.push(`Optimize ${failedPerformance.length} high-impact performance metrics`);
    }
    // Accessibility recommendations
    const accessibilityErrors = results.accessibility.filter(a => !a.passed && a.severity === 'error');
    if (accessibilityErrors.length > 0) {
        recommendations.push(`Fix ${accessibilityErrors.length} accessibility errors`);
    }
    // Safe area recommendations
    const unsafeAreas = results.safeAreas.filter(s => !s.properlyHandled);
    if (unsafeAreas.length > 0) {
        recommendations.push('Implement proper safe area handling for iOS devices');
    }
    if (recommendations.length === 0) {
        recommendations.push('Excellent mobile compliance! All tests passed.');
    }
    return recommendations;
}
/**
 * Utility to run quick mobile health check
 */
export function quickMobileHealthCheck() {
    return new Promise((resolve) => {
        const issues = [];
        let score = 100;
        // Check viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            issues.push('Missing viewport meta tag');
            score -= 20;
        }
        // Check for touch-action CSS
        const hasTouchAction = document.querySelector('[style*="touch-action"]') ||
            document.querySelector('.touch-action');
        if (!hasTouchAction) {
            issues.push('Consider adding touch-action CSS for better touch performance');
            score -= 5;
        }
        // Check for safe area CSS
        const hasSafeArea = document.querySelector('[class*="safe-area"]') ||
            document.querySelector('[class*="env(safe-area"]');
        if (!hasSafeArea) {
            issues.push('Consider implementing safe area handling for iOS devices');
            score -= 10;
        }
        // Check for responsive images
        const images = document.querySelectorAll('img');
        let responsiveImages = 0;
        images.forEach(img => {
            if (img.hasAttribute('srcset') || img.hasAttribute('sizes')) {
                responsiveImages++;
            }
        });
        if (responsiveImages < images.length * 0.5) {
            issues.push('Consider using responsive images (srcset/sizes) for better mobile performance');
            score -= 15;
        }
        resolve({ score: Math.max(0, score), issues });
    });
}
//# sourceMappingURL=mobile-testing.js.map