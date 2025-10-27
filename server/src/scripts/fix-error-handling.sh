#!/bin/bash
# Fix all error.message usages in catch blocks with unknown type

find server/src/routes -name "*.ts" -type f | while read f; do
  # Replace direct error.message access with type guard
  sed -i 's/} catch (error: unknown) {\([^}]*\)error\.message/} catch (error: unknown) {\1const errorMessage = error instanceof Error ? error.message : '"'"'Unknown error'"'"';\1logger.error(/' "$f"
  
  # Fix the response to use errorMessage
  sed -i 's/res\.status(500)\.json({ success: false, error: error\.message });/res.status(500).json({ success: false, error: errorMessage });/g' "$f"
done

