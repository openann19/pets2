#!/bin/bash
# Payment Configuration Test Script
# Tests that payment APIs are properly configured and accessible

set -e

echo "🧪 Testing Payment API Configuration..."

API_BASE_URL="${API_BASE_URL:-http://localhost:5001}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ ADMIN_TOKEN environment variable required"
  echo "   Get token from admin login"
  exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Stripe Configuration
echo "📊 Testing Stripe Configuration..."
STRIPE_RESPONSE=$(curl -s -X GET \
  "$API_BASE_URL/api/admin/stripe/config" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

if echo "$STRIPE_RESPONSE" | grep -q "isConfigured"; then
  if echo "$STRIPE_RESPONSE" | grep -q '"isConfigured":true'; then
    echo -e "${GREEN}✅ Stripe configured${NC}"
  else
    echo -e "${YELLOW}⚠️  Stripe not fully configured${NC}"
    echo "   Response: $STRIPE_RESPONSE"
  fi
else
  echo -e "${RED}❌ Stripe config endpoint failed${NC}"
  echo "   Response: $STRIPE_RESPONSE"
fi

# Test RevenueCat Configuration
echo "📊 Testing RevenueCat Configuration..."
RC_RESPONSE=$(curl -s -X GET \
  "$API_BASE_URL/api/admin/revenuecat/config" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

if echo "$RC_RESPONSE" | grep -q "isConfigured"; then
  if echo "$RC_RESPONSE" | grep -q '"isConfigured":true'; then
    echo -e "${GREEN}✅ RevenueCat configured${NC}"
  else
    echo -e "${YELLOW}⚠️  RevenueCat not fully configured${NC}"
    echo "   Response: $RC_RESPONSE"
  fi
else
  echo -e "${RED}❌ RevenueCat config endpoint failed${NC}"
  echo "   Response: $RC_RESPONSE"
fi

# Test Analytics Endpoints
echo "📊 Testing Analytics Endpoints..."
ANALYTICS_RESPONSE=$(curl -s -X GET \
  "$API_BASE_URL/api/admin/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

if echo "$ANALYTICS_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Analytics endpoint accessible${NC}"
else
  echo -e "${RED}❌ Analytics endpoint failed${NC}"
fi

echo ""
echo "✅ Configuration test complete!"
echo ""
echo "Next steps:"
echo "1. Verify all tests pass"
echo "2. Test payment flows manually"
echo "3. Monitor logs for errors"

