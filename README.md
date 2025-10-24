# Job Application Tracker - Local

A React-based job application tracker ready for Vercel deployment.

## Features

- Built with React 18 and TypeScript
- Vite for fast development and building
- ESLint for code quality
- Ready for Vercel deployment

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

### Option 3: Manual Upload
1. Run `npm run build`
2. Upload the `dist` folder to Vercel

## Configuration

The project includes:
- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
└── index.css        # Global styles
```