# Job Application Tracker - Local

A React-based job application tracker with localStorage persistence, ready for Vercel deployment.

## ✨ Features

- **Persistent Storage**: All data saved to browser localStorage - no database required!
- **Full CRUD Operations**: Add, edit, delete, and update job applications
- **Status Tracking**: Track applications through different stages (Draft → Applied → Interview → Offer)
- **Search & Filter**: Find applications by company, position, or location
- **Dashboard Analytics**: View application statistics and recent activity
- **Responsive Design**: Works on desktop and mobile devices
- **Built with Modern Tech**: React 18, TypeScript, Vite

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 How It Works

The application uses **localStorage** to persist your job application data directly in your browser. This means:
- ✅ No database setup required
- ✅ Data persists between browser sessions
- ✅ Works offline
- ✅ Fast and responsive
- ⚠️ Data is tied to your browser/device

## 🌐 Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will automatically deploy on every push to main branch

### Option 3: Drag & Drop
1. Run `npm run build`
2. Go to [vercel.com](https://vercel.com)
3. Drag and drop the `dist` folder

## 📁 Project Structure

```
src/
├── components/
│   ├── ApplicationForm.tsx    # Add/Edit application form
│   ├── ApplicationList.tsx    # List and manage applications
│   └── Dashboard.tsx          # Analytics and overview
├── hooks/
│   └── useApplications.ts     # Custom hook for application management
├── utils/
│   └── storage.ts             # localStorage utilities
├── types.ts                   # TypeScript type definitions
├── App.tsx                    # Main application component
├── App.css                    # Application styles
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## 🎯 Application Statuses

- **Draft**: Application being prepared
- **Applied**: Application submitted
- **Phone Screen**: Initial phone screening
- **Interview**: In-person/video interview
- **Technical**: Technical assessment
- **Final Round**: Final interview round
- **Offer**: Job offer received
- **Rejected**: Application rejected
- **Withdrawn**: Application withdrawn

## 💾 Data Management

Your application data is automatically saved to localStorage whenever you:
- Add a new application
- Update an existing application
- Change application status
- Delete an application

**Note**: Clearing browser data will remove all applications. Consider exporting important data or using the app consistently on the same browser/device.

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration with SPA routing
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## 🎨 Customization

The app uses a clean, professional design that's easy to customize:
- Modify colors in `src/App.css`
- Add new application statuses in `src/types.ts`
- Extend functionality in `src/hooks/useApplications.ts`

## 🚀 Ready for Production

This application is production-ready with:
- Optimized build output
- Proper error handling
- Responsive design
- TypeScript for type safety
- Modern React patterns