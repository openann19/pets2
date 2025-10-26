#!/bin/bash

################################################################################
# Comprehensive CI Quality Gate Script
# 
# Runs all quality checks in sequence:
# 1. Type checking (TypeScript)
# 2. Linting (ESLint)
# 3. Format checking (Prettier)
# 4. Testing (Jest with coverage)
# 5. Coverage verification (thresholds)
#
# Exit codes:
#   0 = All checks passed
#   1 = One or more checks failed
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track failures
FAILED=0
TOTAL_TIME=0
START_TIME=$(date +%s)

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Create reports directory
mkdir -p _reports

################################################################################
# Step 1: Type Checking
################################################################################
log_step "Step 1/5: Type Checking"

if pnpm -r typecheck > _reports/typecheck.log 2>&1; then
    log_success "Type checking passed"
    TIME=$(date +%s)
    TOTAL_TIME=$((TIME - START_TIME))
else
    log_error "Type checking failed"
    FAILED=1
fi

################################################################################
# Step 2: Linting
################################################################################
log_step "Step 2/5: Linting"

if pnpm -r lint > _reports/lint.log 2>&1; then
    log_success "Linting passed"
else
    log_error "Linting failed"
    FAILED=1
fi

################################################################################
# Step 3: Format Checking
################################################################################
log_step "Step 3/5: Format Checking"

if pnpm -r format:check > _reports/format.log 2>&1; then
    log_success "Format check passed"
else
    log_error "Format check failed"
    FAILED=1
fi

################################################################################
# Step 4: Testing (Unit/Integration)
################################################################################
log_step "Step 4/5: Testing (Unit/Integration)"

if pnpm -r test:ci -- --coverage > _reports/tests.log 2>&1; then
    log_success "Tests passed"
else
    log_error "Tests failed"
    FAILED=1
fi

################################################################################
# Step 5: Coverage Verification
################################################################################
log_step "Step 5/5: Coverage Verification"

if node scripts/verify-coverage.js; then
    log_success "Coverage thresholds met"
else
    log_error "Coverage thresholds not met"
    FAILED=1
fi

################################################################################
# Summary
################################################################################
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_step "CI Quality Gate Summary"

if [ $FAILED -eq 0 ]; then
    log_success "All quality gates passed!"
    log_info "Total time: ${DURATION}s"
    exit 0
else
    log_error "One or more quality gates failed"
    log_error "Check logs in _reports/ directory"
    log_info "Total time: ${DURATION}s"
    exit 1
fi

