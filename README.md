# ASME Tube Calculator

Minimum required wall thickness and maximum allowable working pressure for
boiler tubes, per ASME Boiler and Pressure Vessel Code, Section I, PG-27.2.1.
Includes a built-in allowable stress lookup by material, edition, and
temperature, a calculation log with CSV/JSON export, and a separate tube
bend (torus) check.

This is a static, client-side app. Nothing is sent to a server.

## Live app

https://tylerc515.github.io/asme-tube-calculator/

## Local development

```sh
npm install
npm run dev       # http://localhost:5173
npm test          # run all tests
npm run build     # production build
```

## Architecture decisions

Decision records are in [`docs/decisions/`](docs/decisions/).

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - typecheck and build for production
- `npm run typecheck` - typecheck only
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm test` - run the test suite

## Repository

`main` is the release branch. Pull requests require passing CI
(typecheck, lint, test, build, `npm audit`). Branch protection on `main`
should be enabled to require a PR and passing checks before merge.

## License

MIT, see [LICENSE](LICENSE).
