#!/bin/bash

# SwitchPrint Bridge Service Startup Script

# Set environment variables
export SWITCHPRINT_PORT=5001
export SWITCHPRINT_DEBUG=false
export FLASK_ENV=production

# Check if Python virtual environment is available
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if SwitchPrint is installed
if python3 -c "import codeswitch_ai" 2>/dev/null; then
    echo "✓ SwitchPrint is available"
else
    echo "⚠ SwitchPrint not found, installing..."
    pip install switchprint
fi

# Start the service
echo "Starting SwitchPrint Bridge Service on port $SWITCHPRINT_PORT"
python3 switchprint_service.py