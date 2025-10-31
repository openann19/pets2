/**
 * k6 Load Test: Community Feed Performance
 * 
 * Tests:
 * - GET /api/community/posts - Feed pagination performance
 * - POST /api/community/posts/:id/like - Like operation latency
 * - POST /api/community/posts/:id/comments - Comment creation latency
 * - POST /api/community/posts/:id/join - Activity join latency
 * 
 * Budgets:
 * - Feed p50 < 400ms, p95 < 800ms
 * - Like p95 < 800ms
 * - Comment p95 < 800ms
 * - Join/Leave p95 < 800ms
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const feedP50 = new Trend('feed_p50', true);
const feedP95 = new Trend('feed_p95', true);
const likeLatency = new Trend('like_latency');
const commentLatency = new Trend('comment_latency');
const joinLatency = new Trend('join_latency');

// Error rate
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 VUs
    { duration: '3m', target: 50 },   // Stay at 50 VUs
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],        // < 1% errors
    http_req_duration: ['p(95)<800'],      // p95 < 800ms
    'feed_p95': ['value<800'],              // Feed p95 < 800ms
    'like_latency': ['p(95)<800'],         // Like p95 < 800ms
    'comment_latency': ['p(95)<800'],      // Comment p95 < 800ms
    'errors': ['rate<0.01'],               // < 1% error rate
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(90)', 'p(95)', 'p(99)', 'p(99.9)', 'p(99.99)', 'count'],
};

const API_BASE = __ENV.API_URL || 'http://localhost:5000';
const TOKEN = __ENV.AUTH_TOKEN || 'test-token';

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Test 1: GET Feed
  const feedRes = http.get(
    `${API_BASE}/api/community/posts?page=1&limit=20`,
    { headers }
  );
  
  const feedCheck = check(feedRes, {
    'feed status 200': (r) => r.status === 200,
    'feed has posts': (r) => {
      const body = JSON.parse(r.body);
      return body.success === true && Array.isArray(body.posts);
    },
  });
  
  if (!feedCheck['feed status 200']) {
    errorRate.add(1);
  }
  
  feedP50.add(feedRes.timings.duration);
  feedP95.add(feedRes.timings.duration);
  
  sleep(1);
  
  // Test 2: Like Operation (if post exists)
  if (feedRes.status === 200) {
    const body = JSON.parse(feedRes.body);
    if (body.posts && body.posts.length > 0) {
      const postId = body.posts[0]._id;
      
      const likeRes = http.post(
        `${API_BASE}/api/community/posts/${postId}/like`,
        JSON.stringify({ liked: true }),
        { headers }
      );
      
      const likeCheck = check(likeRes, {
        'like status 200': (r) => r.status === 200 || r.status === 201,
      });
      
      if (!likeCheck['like status 200']) {
        errorRate.add(1);
      }
      
      likeLatency.add(likeRes.timings.duration);
      
      sleep(0.5);
      
      // Test 3: Comment Creation
      const commentRes = http.post(
        `${API_BASE}/api/community/posts/${postId}/comments`,
        JSON.stringify({ content: `Load test comment ${Date.now()}` }),
        { headers }
      );
      
      const commentCheck = check(commentRes, {
        'comment status 201': (r) => r.status === 201 || r.status === 200,
      });
      
      if (!commentCheck['comment status 201']) {
        errorRate.add(1);
      }
      
      commentLatency.add(commentRes.timings.duration);
      
      sleep(0.5);
    }
  }
  
  // Test 4: Activity Join (if activity post exists)
  const activityFeedRes = http.get(
    `${API_BASE}/api/community/posts?type=activity&page=1&limit=1`,
    { headers }
  );
  
  if (activityFeedRes.status === 200) {
    const body = JSON.parse(activityFeedRes.body);
    if (body.posts && body.posts.length > 0) {
      const activityId = body.posts[0]._id;
      
      const joinRes = http.post(
        `${API_BASE}/api/community/posts/${activityId}/join`,
        JSON.stringify({}),
        { headers }
      );
      
      const joinCheck = check(joinRes, {
        'join status 200': (r) => r.status === 200 || r.status === 201,
      });
      
      if (!joinCheck['join status 200']) {
        errorRate.add(1);
      }
      
      joinLatency.add(joinRes.timings.duration);
    }
  }
  
  sleep(1);
}

export function handleSummary(data) {
  // Check if thresholds are met
  const thresholds = data.metrics;
  const results = {
    passed: true,
    details: {},
  };
  
  // Feed p95 check
  if (thresholds.feed_p95) {
    const p95 = thresholds.feed_p95.values.p95;
    results.details.feed_p95 = {
      value: p95,
      threshold: 800,
      passed: p95 < 800,
    };
    if (p95 >= 800) results.passed = false;
  }
  
  // Like latency check
  if (thresholds.like_latency) {
    const p95 = thresholds.like_latency.values.p95;
    results.details.like_p95 = {
      value: p95,
      threshold: 800,
      passed: p95 < 800,
    };
    if (p95 >= 800) results.passed = false;
  }
  
  // Comment latency check
  if (thresholds.comment_latency) {
    const p95 = thresholds.comment_latency.values.p95;
    results.details.comment_p95 = {
      value: p95,
      threshold: 800,
      passed: p95 < 800,
    };
    if (p95 >= 800) results.passed = false;
  }
  
  // Error rate check
  if (thresholds.errors) {
    const rate = thresholds.errors.values.rate;
    results.details.error_rate = {
      value: rate,
      threshold: 0.01,
      passed: rate < 0.01,
    };
    if (rate >= 0.01) results.passed = false;
  }
  
  return {
    stdout: JSON.stringify(results, null, 2),
    'performance-report.json': JSON.stringify(results, null, 2),
  };
}

