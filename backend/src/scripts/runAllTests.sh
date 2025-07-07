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

# Check if SwitchPrint service is running  
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ SwitchPrint service is running (port 5001)"
else
    echo "⚠️  SwitchPrint service is not running on port 5001"
    echo "   Starting SwitchPrint service..."
    cd python_bridge
    ./start_service.sh &
    SWITCHPRINT_PID=$!
    cd ..
    sleep 5
    
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ SwitchPrint service started successfully"
    else
        echo "❌ Failed to start SwitchPrint service"
        echo "   Tests will run with fallback to ELD only"
    fi
fi

echo ""
echo "🧪 Running comprehensive feature tests..."
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

# Cleanup: Kill SwitchPrint service if we started it
if [ ! -z "$SWITCHPRINT_PID" ]; then
    echo ""
    echo "🧹 Cleaning up..."
    kill $SWITCHPRINT_PID 2>/dev/null
    echo "✅ SwitchPrint service stopped"
fi

echo ""
echo "📊 For detailed results, review the test output above"
echo "🚀 CodeBoard testing complete!"

exit $TEST_EXIT_CODE