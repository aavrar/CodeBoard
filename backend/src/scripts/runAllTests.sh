#!/bin/bash

# CodeBoard Comprehensive Test Runner
# Runs all tests for the entire platform

echo "🚀 CodeBoard Comprehensive Feature Test Suite"
echo "=============================================="
echo ""

# Check if required services are running
echo "🔍 Checking required services..."

# Check if backend is running
if curl -s http://localhost:3001/ping > /dev/null; then
    echo "✅ Backend service is running (port 3001)"
else
    echo "❌ Backend service is not running on port 3001"
    echo "   Please start backend with: npm run dev"
    exit 1
fi

echo ""
echo "Running comprehensive feature tests..."
echo ""

# Run the comprehensive test suite
node --import tsx/esm src/scripts/comprehensiveFeatureTests.ts

TEST_EXIT_CODE=$?

echo ""
echo "📋 Test Summary"
echo "==============="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests completed successfully"
    echo "🎉 CodeBoard platform is fully functional!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
    echo "🔧 Please review failed tests and fix issues"
fi

echo ""
echo "📊 For detailed results, review the test output above"
echo "🚀 CodeBoard testing complete!"

exit $TEST_EXIT_CODE