#!/bin/bash
# Fix deprecated import statements

# Fix NewComponents imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "../components/NewComponents"|from "../components"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\./components/NewComponents"|from "\./components"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "../../components/NewComponents"|from "../../components"|g'

# Fix EliteComponents imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "../components/EliteComponents"|from "../components"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "\./components/EliteComponents"|from "\./components"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "../../components/EliteComponents"|from "../../components"|g'

echo "Deprecated imports fixed"
