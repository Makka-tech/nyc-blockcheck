# Contributing to NYC BlockCheck

Thanks for improving a public-interest tool.

## Development workflow

1. Fork and branch from `main`.
2. Run `npm install`, then `npm run lint`, `npm run typecheck`, and `npm test`.
3. Keep adapters in `src/lib/nyc-data/` narrowly scoped and normalize data before it reaches UI components.
4. Add tests for data transformations, scoring changes, and edge cases such as empty records or source outages.
5. Open a focused pull request using the template.

## Data contributions

Please link official documentation or current Socrata metadata for proposed fields or datasets. Never use protected or sensitive characteristics to rank locations. Avoid claims that a building or neighborhood is objectively safe or unsafe, and distinguish missing records from affirmative evidence.

## Style

Use TypeScript strict mode, Prettier, accessible semantic HTML, and source-backed wording. Do not add trackers, accounts, or paid/proprietary APIs without a public discussion first.
