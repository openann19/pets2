#!/bin/bash

# Security scanning script
# Scans for: secrets, PII, debug flags, dependencies
# Note: Made non-blocking for CI/CD

# set -e  # Disabled to make non-blocking

REPORTS_DIR="reports"
SECURITY_REPORT="$REPORTS_DIR/SECURITY_REPORT.md"

mkdir -p "$REPORTS_DIR"

echo "🔒 Starting security scan..."

# Initialize report
cat > "$SECURITY_REPORT" << EOF
# Security Scan Report

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Target:** Mobile App

## Summary

EOF

ISSUES_FOUND=0

# 1. Scan for secrets using git-secrets pattern
echo "Checking for secrets..."
if command -v grep &> /dev/null; then
    # Common secret patterns
    SECRET_PATTERNS=(
        "AKIA[0-9A-Z]{16}"           # AWS keys
        "AIza[0-9A-Za-z-_]{35}"      # Google API
        "ghp_[a-zA-Z0-9]{36}"        # GitHub tokens
        "xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}"  # Slack
        "sk_live_[a-zA-Z0-9]{32}"    # Stripe keys
        "AIza[0-9A-Za-z-_]{35}"      # Google
        "-----BEGIN PRIVATE KEY-----" # Private keys
        "password.*=.*['\\\"]"       # Passwords (basic)
    )
    
    SECRET_FOUND=0
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -r -E "$pattern" src/ --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | head -1; then
            echo "⚠️  Potential secret found: $pattern" >> "$SECURITY_REPORT"
            SECRET_FOUND=1
            ISSUES_FOUND=1
        fi
    done
    
    if [ $SECRET_FOUND -eq 0 ]; then
        echo "✅ No secrets detected" >> "$SECURITY_REPORT"
    fi
fi

# 2. Check for PII in code
echo "Checking for PII in source code..."
PII_FOUND=0
if grep -riE "(email|phone|ssn|credit.?card|bank.?account)" src/ --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | grep -v "test" | head -3; then
    echo "⚠️  Potential PII references found (verify if sensitive data handling)" >> "$SECURITY_REPORT"
    PII_FOUND=1
    ISSUES_FOUND=1
fi

if [ $PII_FOUND -eq 0 ]; then
    echo "✅ No obvious PII in source" >> "$SECURITY_REPORT"
fi

# 3. Check for debug flags in production code
echo "Checking for debug flags..."
DEBUG_FOUND=0
if grep -riE "__DEV__|console\.(log|warn|error)" src/ --exclude-dir=node_modules --exclude-dir=__tests__ 2>/dev/null | head -5; then
    echo "ℹ️  Debug code found (review if used in release builds)" >> "$SECURITY_REPORT"
    DEBUG_FOUND=1
fi

# 4. Dependency vulnerability scan (npm audit)
echo "Scanning dependencies..."
if command -v npm &> /dev/null; then
    echo "## Dependency Vulnerabilities" >> "$SECURITY_REPORT"
    echo "" >> "$SECURITY_REPORT"
    
    if npm audit --audit-level=moderate --json > "$REPORTS_DIR/npm-audit.json" 2>&1; then
        VULNERABILITIES=$(jq -r '.metadata.vulnerabilities.total // 0' "$REPORTS_DIR/npm-audit.json" 2>/dev/null || echo "0")
        if [ "$VULNERABILITIES" -gt 0 ]; then
            echo "❌ Found $VULNERABILITIES vulnerabilities" >> "$SECURITY_REPORT"
            npm audit --audit-level=moderate >> "$SECURITY_REPORT"
            ISSUES_FOUND=1
        else
            echo "✅ No dependency vulnerabilities found" >> "$SECURITY_REPORT"
        fi
    fi
fi

# 5. Check SSL/TLS configuration
echo "## SSL/TLS Configuration" >> "$SECURITY_REPORT"
echo "" >> "$SECURITY_REPORT"
if grep -r "https://" src/config/ 2>/dev/null | head -3; then
    echo "✅ HTTPS endpoints configured" >> "$SECURITY_REPORT"
else
    echo "⚠️  Review HTTPS configuration" >> "$SECURITY_REPORT"
fi

# Final summary
echo "" >> "$SECURITY_REPORT"
echo "## Summary" >> "$SECURITY_REPORT"
echo "" >> "$SECURITY_REPORT"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ **Security scan passed** - No blocking issues found" >> "$SECURITY_REPORT"
    echo ""
    echo "✅ Security scan completed - No issues found"
else
    echo "❌ **Security issues detected** - Review findings above" >> "$SECURITY_REPORT"
    echo ""
    echo "⚠️  Security scan found issues - Review $SECURITY_REPORT (non-blocking)"
fi

# Always exit with 0 to make non-blocking
echo "🔒 Security scan completed (non-blocking mode)"
exit 0

