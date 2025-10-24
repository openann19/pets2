# Console to Logger Migration Toolkit

This toolkit provides tools to safely migrate from `console.*` statements to structured logging using the logger from `@pawfectmatch/core`. The migration is compliant with the standards in `ENGINEERING_EXCELLENCE_COMPLETE.md` and `rules.md`.

## Why Use Structured Logging?

- **Better Error Context**: Structured metadata instead of concatenated strings
- **Log Filtering**: Easier filtering by log level and properties
- **Performance**: Better performance than console methods, especially in production
- **Standardization**: Unified logging approach across the entire codebase

## Scripts Included

1. **console-to-logger.cjs**: Main script to replace console calls with logger
2. **restore-backups.cjs**: Script to restore from backups if needed
3. **verify-changes.cjs**: Script to verify that changes don't introduce errors
4. **test-replace.cjs**: Simple test script for testing on smaller codebases

## How It Works

The replacement script:

1. Scans the codebase for console.log/error/warn/info/debug statements
2. Creates backups of files before making changes
3. Transforms console statements to appropriate logger methods
4. Adds logger imports where needed
5. Handles different parameter formats intelligently

### Transformation Rules

- `console.log` → `logger.debug`
- `console.error` → `logger.error`
- `console.warn` → `logger.warn`
- `console.info` → `logger.info`
- `console.debug` → `logger.debug`

### Metadata Handling

The script intelligently handles different parameter formats:

```javascript
// Before
console.error("Failed to fetch data", error);

// After
logger.error("Failed to fetch data", { error });
```

## Usage

### Counting Console Statements

To see how many console statements are in the codebase:

```bash
node scripts/console-to-logger.cjs --path=apps/ --count-only
```

### Dry Run

To see what changes would be made without actually making them:

```bash
node scripts/console-to-logger.cjs --path=apps/ --dry-run
```

### Run the Migration

To perform the actual migration:

```bash
node scripts/console-to-logger.cjs --path=apps/
```

### Restore from Backups

If you need to revert changes:

```bash
node scripts/restore-backups.cjs
```

### Verify Changes

To verify that no errors were introduced:

```bash
node scripts/verify-changes.cjs
```

To automatically revert files with errors:

```bash
node scripts/verify-changes.cjs --revert-broken
```

## Enhanced Safety Options

The script includes several options for ensuring code safety:

- `--safe-mode`: Enable additional safety checks to prevent breaking code
- `--batch-size=<number>`: Process files in batches to manage resources better
- `--skip-complex`: Skip files with complex console patterns that might break
- `--max-changes=<number>`: Limit the number of changes per file (default: 20)

## Options

- `--path=<directory>`: Directory to process (default: apps/)
- `--dry-run`: Show changes without making them
- `--count-only`: Just count console statements
- `--no-backup`: Skip creating backups (not recommended)
- `--backup-dir=<directory>`: Custom backup directory (default: console-backup)
- `--ext=js,jsx,ts,tsx`: File extensions to process
- `--skip=dir1,dir2`: Directories to skip
- `--verbose`: Show detailed output

## Safety Features

1. Automatic backups before any modifications
2. Dry run mode to preview changes
3. Comprehensive reporting
4. Detailed error logging
5. Restore functionality

## Examples

### Example: Count console statements in specific directory

```bash
node scripts/console-to-logger.cjs --path=apps/mobile/ --count-only
```

### Example: Run migration on specific file types

```bash
node scripts/console-to-logger.cjs --path=apps/web/ --ext=tsx,ts
```

### Example: Skip additional directories

```bash
node scripts/console-to-logger.cjs --skip=coverage,node_modules,dist,build,__tests__,tests,fixtures
```

## Recommended Workflow for Safety

For maximum safety, follow this workflow:

1. First, count console statements:
   ```
   node scripts/console-to-logger.cjs --count-only
   ```

2. Test with dry run to see what changes would be made:
   ```
   node scripts/console-to-logger.cjs --dry-run
   ```

3. Run on a small subset with safety features:
   ```
   node scripts/console-to-logger.cjs --path=apps/mobile/src/components --safe-mode --skip-complex
   ```

4. Verify the changes:
   ```
   node scripts/verify-changes.cjs
   ```

5. Run on the rest of the codebase in batches:
   ```
   node scripts/console-to-logger.cjs --safe-mode --batch-size=20
   ```

## Troubleshooting

If you encounter issues:

1. Try running with `--dry-run` first to see what changes would be made
2. Check the error output for specific file issues
3. Use the `verify-changes.cjs --revert-broken` script to automatically revert problematic files
4. Use the `restore-backups.cjs` script to revert all changes if needed
5. For complex files, consider manual migration
6. Use `--skip-complex` to automatically skip files with complicated console usage

## Contribution

Feel free to improve these scripts by adding support for:

- More complex console statement patterns
- Better error handling
- Advanced import management

## License

Internal use only - PawfectMatch Engineering Team