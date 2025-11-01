# Job Application Tracker

A React-based job application tracker with Supabase backend for cross-device synchronization.

## ✨ Features

- **🤖 AI-Powered Analysis**: Automatically extract job details from URLs using Google Gemini AI
- **🔄 Cross-Device Sync**: Access your applications from any device with Supabase backend
- **🔐 User Authentication**: Secure sign-up/sign-in with email and password
- **📝 Full CRUD Operations**: Add, edit, delete, and update job applications
- **📊 Status Tracking**: Track applications through different stages (Draft → Applied → Interview → Offer)
- **🔍 Smart Search & Filter**: Find applications by company, position, location, tech stack, and more
- **📈 Dashboard Analytics**: View application statistics and recent activity
- **📱 Responsive Design**: Works on desktop and mobile devices
- **⚡ Real-time Updates**: Changes sync instantly across all your devices
- **🛠️ Tech Stack Tracking**: Automatically detect and track required technologies
- **💼 Work Mode Detection**: Remote, Hybrid, or On-site classification
- **🎯 Confidence Scoring**: AI provides confidence levels for extracted information
- **🚀 Built with Modern Tech**: React 18, TypeScript, Vite, Supabase, Google Gemini AI

## 🚀 Quick Start

1. **Set up Supabase** (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and Gemini API credentials
   ```

3. **Install and run**:
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

The application uses **Supabase** as a backend-as-a-service to store and sync your job application data. This means:
- ✅ Access your data from any device
- ✅ Real-time synchronization
- ✅ Secure user authentication
- ✅ Automatic backups
- ✅ Fast and responsive
- ✅ Data is safely stored in the cloud

## 🔧 Setup Requirements

Before running the application, you need to:
1. **Create a Supabase project** - For database and authentication
2. **Get a Google Gemini API key** - For AI-powered job analysis
3. **Set up the database schema** - Tables and security policies
4. **Configure environment variables** - API keys and URLs

**Setup Guides:**
- 📚 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database and authentication setup
- 🤖 [AI_SETUP.md](./AI_SETUP.md) - AI features and Gemini API setup

## 🌐 Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to production
vercel --prod
```

**Important**: Add your environment variables to Vercel:
- Go to your Vercel project → Settings → Environment Variables
- Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY`

### Option 2: GitHub Integration
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables in Vercel dashboard
4. Vercel will automatically deploy on every push to main branch

### Option 3: Drag & Drop
1. Create a `.env` file with your Supabase and Gemini API credentials
2. Run `npm run build`
3. Go to [vercel.com](https://vercel.com)
4. Drag and drop the `dist` folder
5. Add all environment variables in the Vercel dashboard

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

Your application data is automatically synced with Supabase whenever you:
- Add a new application
- Update an existing application
- Change application status
- Delete an application

**Benefits**:
- ✅ Access from any device
- ✅ Automatic cloud backups
- ✅ Real-time synchronization
- ✅ Secure user authentication
- ✅ Data persistence across devices

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