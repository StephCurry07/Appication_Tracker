#!/usr/bin/env node

/**
 * Development setup script for Job Application Tracker
 * This script helps manage Supabase development workflow
 */

import execSync from 'child_process';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables:');
    if (!SUPABASE_URL) console.error('  - VITE_SUPABASE_URL');
    if (!SUPABASE_ANON_KEY) console.error('  - VITE_SUPABASE_ANON_KEY');
    console.log('\n💡 Please check your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
}

function resetDatabase() {
  console.log('\n🗑️  Resetting database...');
  
  const resetSQL = `
-- Drop all tables and policies
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

DROP TRIGGER IF EXISTS handle_updated_at_job_applications ON public.job_applications;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
  `;
  
  fs.writeFileSync('temp_reset.sql', resetSQL);
  
  try {
    // You would run this through Supabase CLI or dashboard
    console.log('📝 Reset SQL written to temp_reset.sql');
    console.log('🔧 Please run this SQL in your Supabase dashboard SQL Editor');
    console.log('   Or use: supabase db reset (if using local development)');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
  }
}

function runMigrations() {
  console.log('\n📦 Running migrations...');
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 Creating migrations directory...');
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  console.log(`📋 Found ${migrations.length} migrations:`);
  migrations.forEach(migration => {
    console.log(`   - ${migration}`);
  });
  
  console.log('\n💡 To apply migrations:');
  console.log('   1. Go to your Supabase dashboard');
  console.log('   2. Open SQL Editor');
  console.log('   3. Run each migration file in order');
  console.log('   Or use: supabase db push (if using local development)');
}

function createEnvExample() {
  const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Example:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# VITE_GEMINI_API_KEY=AIzaSyD...`;

  fs.writeFileSync('.env.example', envExample);
  console.log('✅ Created .env.example');
}

function main() {
  const command = process.argv[2];
  
  console.log('🚀 Job Application Tracker - Development Setup\n');
  
  switch (command) {
    case 'check':
      checkEnvironment();
      break;
      
    case 'reset':
      resetDatabase();
      break;
      
    case 'migrate':
      runMigrations();
      break;
      
    case 'setup':
      checkEnvironment();
      runMigrations();
      break;
      
    case 'env':
      createEnvExample();
      break;
      
    default:
      console.log('📖 Available commands:');
      console.log('   node scripts/dev-setup.js check    - Check environment variables');
      console.log('   node scripts/dev-setup.js reset    - Generate database reset SQL');
      console.log('   node scripts/dev-setup.js migrate  - List available migrations');
      console.log('   node scripts/dev-setup.js setup    - Check env and list migrations');
      console.log('   node scripts/dev-setup.js env      - Create .env.example file');
      console.log('\n💡 For full setup, run: npm run dev:setup');
      break;
  }
}

main();