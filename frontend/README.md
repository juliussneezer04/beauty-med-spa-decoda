# Beauty Med Spa Patient Dashboard Frontend

## Getting Started

To get started, install the dependencies:

```bash
npm install
```

Or if you're using Bun:

```bash
bun install
```

## Configuration

The frontend connects to the backend API. By default, it expects the backend to be running at `http://127.0.0.1:8000`.

If your backend is running on a different URL, create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the app

To run the Next.js development server, use one of the following methods:

### Method 1: Using npm

```bash
npm run dev
```

### Method 2: Using Bun

```bash
bun run dev
```

The frontend will be available at:

- Frontend: http://localhost:3000

**Note:** Make sure the backend server is running before starting the frontend. The frontend requires the backend API to be available at the configured URL.

## Generating API Types

The frontend uses TypeScript types generated from the backend OpenAPI schema. To generate or update these types, first ensure the backend is running, then run:

```bash
npm run dev:gen-api-types
```

Or with Bun:

```bash
bun run dev:gen-api-types
```

This will fetch the OpenAPI schema from the backend and generate TypeScript types in `server.d.ts`.

## Building for Production

To build the application for production:

```bash
npm run build
```

Or with Bun:

```bash
bun run build
```

To start the production server:

```bash
npm run start
```

Or with Bun:

```bash
bun run start
```

## Type Checking

To check TypeScript types without building:

```bash
npm run check-types
```

Or with Bun:

```bash
bun run check-types
```

## Linting

To run ESLint:

```bash
npm run lint
```

Or with Bun:

```bash
bun run lint
```
