#!/bin/bash
cd /Users/obedvargasvillarreal/github-profile-optimization/vercel-ai-agents

echo "Processing vercel-ai-agents console statements..."

# Find files with console statements (excluding logger.ts)
find . -name "*.ts" -o -name "*.tsx" | grep -v logger.ts | while read file; do
    if grep -q "console\." "$file"; then
        echo "Processing: $file"

        # Add logger import if not present
        if ! grep -q "from.*lib/logger" "$file"; then
            if grep -q "^import" "$file"; then
                last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
                sed -i '' "${last_import_line}a\\
import { logger, clientLogger } from '@/lib/logger';" "$file"
            fi
        fi

        # Replace console statements
        sed -i '' 's/console\.error(/logger.error(/g' "$file"
        sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
        sed -i '' 's/console\.log(/logger.debug(/g' "$file"
        sed -i '' 's/console\.info(/logger.info(/g' "$file"
        sed -i '' 's/console\.debug(/logger.debug(/g' "$file"

        # For client-side files, use clientLogger
        if [[ "$file" == *"components"* ]] || [[ "$file" == *"app/page"* ]] || [[ "$file" == *"hooks"* ]]; then
            sed -i '' 's/logger\.error(/clientLogger.error(/g' "$file"
            sed -i '' 's/logger\.warn(/clientLogger.warn(/g' "$file"
            sed -i '' 's/logger\.debug(/clientLogger.debug(/g' "$file"
            sed -i '' 's/logger\.info(/clientLogger.info(/g' "$file"
        fi
    fi
done

echo "Completed vercel-ai-agents console.log replacement!"