# Glimpse

A standalone Angular 18+ app for quickly searching up Magic: The Gathering cards. Users can log in with magic links, browse card data from Scryfall, and maintain personalized card collections.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Environment Configuration](#environment-configuration)
5. [Architecture Overview](#architecture-overview)
6. [Available Scripts](#available-scripts)
7. [Testing](#testing)
8. [Linting & Formatting](#linting--formatting)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [FAQ](#faq)
12. [License](#license)
13. [Contact](#contact)

---

## Features

- **Passwordless Authentication** via magic-link emails
- **Card Detail View** showing the current "average" price of a card
- **Persistent Card Lists** stored per user
- **Functional Interceptors** for auth header injection, error handling, and running totals

---

## Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 9.x (or **Yarn** ≥ 1.22)
- **Angular CLI** ≥ 18.x (`npm install -g @angular/cli`)
- A **MongoDB**-compatible connection string (e.g. Amazon DocumentDB)

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/glimpse.git
   cd glimpse
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment files**

   - Update `environment.ts` and `environment.prod.ts` with your API and auth secrets.

4. **Run in development mode**

   ```bash
   ng serve
   # Open http://localhost:4200 in your browser
   ```

5. **Build for production**
   ```bash
   npm run build
   # Artifacts output in the `dist/` folder
   ```

---

## Environment Configuration

| Variable                | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `apiUrl`                | Base URL for the backend API (https://api.glimpsecard.com/api) |
| `magicLinkSecret`       | Secret for signing magic-link tokens                           |
| `mongoConnectionString` | MongoDB/DocumentDB URI                                         |
| `production`            | `true` for prod builds                                         |

---

## Architecture Overview

```
+-----------+       +--------------+     +-------------+
| Angular   | <-->  | Express API  | <-- | MongoDB /   |
| Frontend  |       | (Node.js)    |     | DocumentDB  |
+-----------+       +--------------+     +-------------+
        ▲                    ▲                  ▲
        │    Magic links     │             Scryfall API
        └─ Email via Nodemailer
```

- **Standalone Components** bootstrapped via `bootstrapApplication()` in `main.ts`
- **Routing** configured with `provideRouter()` and `loadComponent` dynamic imports
- **HTTP** uses `provideHttpClient(withInterceptorsFromDi(), withInterceptors([...]))`
- **State** managed with Signals and Effects in services

---

## Available Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm start`     | `ng serve` locally                    |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm test`      | Run unit tests                        |
| `npm run lint`  | Run ESLint                            |
| `npm run e2e`   | Run end-to-end tests (if configured)  |

---

## Testing

- **Unit tests** live alongside each service, component, and interceptor as `.spec.ts` files.
- **Run all tests**:
  ```bash
  npm test
  ```
- Tests use `provideHttpClientTesting()` for HTTP mocks.

---

## Linting & Formatting

- **ESLint** configured for Angular and TypeScript rules
- **Prettier** for consistent formatting

Run:

```bash
npm run lint
npm run format
```

---

## Deployment

### General

1. **Build** for production:
   ```bash
   npm run build -- --configuration production
   ```
2. **Serve** the `dist/` folder with any static host (S3 + CloudFront, Firebase Hosting, etc.)
3. **Backend**: Deploy your Express API (Elastic Beanstalk, Kubernetes, etc.) and configure CORS to allow your domain.
4. **HTTPS**: Use a TLS certificate (via AWS Certificate Manager or Let’s Encrypt).

### My Workflow

#### Backend

CD to /backend
Run `eb deploy`

1. Copy updated files into deploy folder
2. Move previous zip into archive folder
3. Zip everything except the archive folder
4. Rename zip with date and version for the day
5. Upload to ElasticBeanstalk
6. Wait until complete.

#### Frontend

Trying this out `npm run deploy`

1. Run `ng build`
2. Go to `/dist` folder
3. Upload `3rdpartylicenses.txt` to S3 bucket
4. Go to `/dist/browser` folder
5. Upload everything to S3 bucket
6. In AWS, go to CloudFront
7. Go to the distribution
8. Go to the Invalidations tab
9. Create a new Invalidation
10. Define invalidation rules (`"/*"` will blanket update everything)
11. Wait until complete.

---

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feat/awesome-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add awesome feature"
   ```
4. Push and open a Pull Request

---

## FAQ

#### Q: What do you mean by "average" price?

The purpose is to see how much a card costs, if you don't care what printing it is.
For example, Llanowar Elves has a ton of printings, and a wide spread of prices.
I don't care which version it is, I just want to know roughly how much a Llanowar Elves card would cost.

#### Q: Why is your code so weird?

I made liberal use of ChatGPT to learn modern Angular best practices, and had it write many templates for me.
I'm sure I've missed a hallucination here or there, so I'm constantly looking for things to tidy up.

---

## License

MIT © 2025 Kevin Capener

---

## Contact

Built and maintained by Kevin Capener – kevincapener@gmail.com

Project: https://github.com/ktcapester/glimpse
