#!/bin/bash
# Script to kill process on port 3000
# Usage: ./kill-port.sh [port]

PORT=${1:-3000}

echo "Checking for processes on port $PORT..."

# macOS/Linux
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ -z "$PID" ]; then
        echo "No process found on port $PORT"
    else
        echo "Killing process $PID on port $PORT"
        kill -9 $PID
        echo "Port $PORT is now free"
    fi
# Windows (if using Git Bash or WSL)
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    PID=$(netstat -ano | findstr :$PORT | findstr LISTENING | awk '{print $5}')
    if [ -z "$PID" ]; then
        echo "No process found on port $PORT"
    else
        echo "Killing process $PID on port $PORT"
        taskkill //F //PID $PID
        echo "Port $PORT is now free"
    fi
else
    echo "Unsupported OS. Please manually kill the process on port $PORT"
fi

