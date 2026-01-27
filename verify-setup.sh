#!/bin/bash
# Verify microservices setup for Code Arena

echo ""
echo "============================================"
echo "Code Arena - Microservices Verification"
echo "============================================"
echo ""

ERROR_COUNT=0

# Check Java
echo -n "Checking Java 17+... "
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[0-9]+')
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo "✓ Found (Java $JAVA_VERSION)"
    else
        echo "✗ Found (Java $JAVA_VERSION, need 17+)"
        ERROR_COUNT=$((ERROR_COUNT+1))
    fi
else
    echo "✗ Not installed"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Check Maven
echo -n "Checking Maven 3.8+... "
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version 2>&1 | grep "Apache Maven" | grep -oP '\d+\.\d+')
    echo "✓ Found ($MVN_VERSION)"
else
    echo "✗ Not installed"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Check Node
echo -n "Checking Node.js 18+... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v 2>&1 | grep -oP 'v\K[0-9]+' | cut -d. -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo "✓ Found (Node $NODE_VERSION)"
    else
        echo "✗ Found (Node $NODE_VERSION, need 18+)"
        ERROR_COUNT=$((ERROR_COUNT+1))
    fi
else
    echo "✗ Not installed"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    npm -v > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ Found"
    else
        echo "✗ Error"
        ERROR_COUNT=$((ERROR_COUNT+1))
    fi
else
    echo "✗ Not installed"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Check MySQL
echo -n "Checking MySQL connection... "
if command -v mysql &> /dev/null; then
    mysql -u root -p root254 -e "SELECT 1" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ Connected (127.0.0.1:3306)"
    else
        echo "✗ Connection failed"
        ERROR_COUNT=$((ERROR_COUNT+1))
    fi
else
    echo "✗ Client not installed"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Check directories
echo ""
echo "Checking directory structure:"
echo -n "  Frontend... "
if [ -d "code-arena-live/src" ]; then
    echo "✓"
else
    echo "✗"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

echo -n "  Backend... "
if [ -d "code-arena-live/server/src" ]; then
    echo "✓"
else
    echo "✗"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

echo -n "  Microservice... "
if [ -d "code-arena-microservices/user-service/src" ]; then
    echo "✓"
else
    echo "✗"
    ERROR_COUNT=$((ERROR_COUNT+1))
fi

# Summary
echo ""
echo "============================================"
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✓ All checks passed!"
    echo "============================================"
    echo ""
    echo "You can now run:"
    echo "  ./start-microservices.sh"
    echo ""
    exit 0
else
    echo "✗ Found $ERROR_COUNT issue(s)"
    echo "============================================"
    echo ""
    echo "Please fix the issues above before starting."
    echo ""
    exit 1
fi
