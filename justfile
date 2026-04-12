# Clean caches
clean-caches:
    rm -rf node_modules .npm-cache

# Clean generated files
clean:
    rm -rf dist build

# Clean all caches and generated files
clean-all: clean-caches clean

# Initial setup
setup:
    npm install

# Run local dev server
run:
    npm run dev

# Deploy (version update, full build with tests, deploy to target)
deploy:
    npm run deploy

# Lint and type-check code
check:
    npm run check-code

# Run tests
test *args:
    npm run test -- run {{args}}

# Run tests without console output
test-quiet:
    npm run test -- run --silent

# Audit for security vulnerabilities
audit:
    npm audit
