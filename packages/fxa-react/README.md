# Shared components for FxA React Apps

## Testing

This package uses [Jest](https://jestjs.io/) to test its code. By default `npm test` will test all JS files under `src/`.

Test specific tests with the following commands:

```bash
# Test for the component ComponentName
yarn test -- ComponentName

# Grep for "description"
yarn test -- -t "description"

# Watch files for changes and re-run
yarn test -- --watch
```

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## License

MPL-2.0
