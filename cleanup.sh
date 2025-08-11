#!/bin/bash

# Script to clean up unused code and console logs

echo "🧹 Cleaning up project..."

# Remove console.log statements (but keep console.error for debugging)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/console\.log(/d'

# Run ESLint to fix auto-fixable issues
npm run lint -- --fix 2>/dev/null || true

echo "✅ Cleanup completed!"
echo "📝 Manual review needed for:"
echo "   - Unused imports (will show in build warnings)"
echo "   - Unused variables (will show in build warnings)"
echo "   - Console.error statements (kept for debugging)"

# Show remaining console statements
echo ""
echo "🔍 Remaining console statements:"
grep -r "console\." src/ --include="*.ts" --include="*.tsx" | head -10 || echo "   None found!"
