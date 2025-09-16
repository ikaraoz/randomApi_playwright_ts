# RandomUser API Functional Testing with Playwright

This project provides a suite of functional tests for the [RandomUser API](https://randomuser.me/), using [Playwright](https://playwright.dev/) and TypeScript.

## Project Structure

```
randomApi_playwright_ts/
├── tests/
│   ├── api/
│   │   └── randomUser.test.ts         # Main test suite for RandomUser API
│   └── utils/
│       ├── apiRequest.ts              # API request helpers
│       ├── testParams.ts              # Query parameter examples
│       └── assertions.ts              # Custom assertion functions
├── playwright.config.ts               # Playwright configuration (baseURL, etc.)
├── package.json                       # Project dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```
   git clone <your-repo-url>
   cd randomApi_playwright_ts
   ```

2. Install dependencies:

   ```
   npm install
   ```

### Running Tests

To run all tests:

```
npx playwright test
```

To run a specific test file:

```
npx playwright test tests/api/randomUser.test.ts
```

## Customization

- Add new query parameter sets in `tests/utils/testParams.ts`.
- Extend or modify assertions in `tests/utils/assertions.ts`.
- Add more test suites in `tests/api/` as needed.
