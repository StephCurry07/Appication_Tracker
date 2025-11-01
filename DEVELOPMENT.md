# Development Guide

This guide provides a structured approach to developing with Supabase, avoiding the need to manually delete tables and re-run SQL scripts.

## 🛠️ Development Workflow

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd Application_Tracker_local
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Check Environment**
   ```bash
   node scripts/dev-setup.js check
   ```

### Database Management

#### Option 1: Using Migrations (Recommended)

1. **Apply Initial Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/20241101000001_initial_schema.sql`

2. **Apply AI Fields Migration**
   - Run `supabase/migrations/20241101000002_add_ai_fields.sql`

3. **For Future Changes**
   - Create new migration files with timestamp naming
   - Apply them in order

#### Option 2: Using Development Scripts

1. **Reset Database (when needed)**
   ```bash
   node scripts/dev-setup.js reset
   # This generates a reset SQL file - run it in Supabase dashboard
   ```

2. **Apply Migrations**
   ```bash
   node scripts/dev-setup.js migrate
   # Lists available migrations to run
   ```

### Common Development Tasks

#### Adding New Fields

1. **Create Migration File**
   ```sql
   -- supabase/migrations/20241101000003_add_new_field.sql
   ALTER TABLE public.job_applications 
   ADD COLUMN IF NOT EXISTS new_field TEXT;
   ```

2. **Update TypeScript Types**
   ```typescript
   // src/types.ts
   export interface JobApplication {
     // ... existing fields
     newField?: string;
   }
   ```

3. **Update Components**
   - Add field to forms
   - Update display components
   - Handle in Supabase hooks

#### Fixing Policy Issues

1. **Check Current Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'job_applications';
   ```

2. **Drop and Recreate Policy**
   ```sql
   DROP POLICY IF EXISTS "policy_name" ON public.job_applications;
   CREATE POLICY "policy_name" ON public.job_applications
       FOR SELECT USING (auth.uid() = user_id);
   ```

#### Handling Key Issues

1. **Check Constraints**
   ```sql
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'job_applications';
   ```

2. **Drop and Recreate Constraint**
   ```sql
   ALTER TABLE public.job_applications 
   DROP CONSTRAINT IF EXISTS constraint_name;
   
   ALTER TABLE public.job_applications 
   ADD CONSTRAINT constraint_name CHECK (condition);
   ```

## 🔄 Safe Development Practices

### 1. Use Migrations Instead of Manual SQL

❌ **Don't do this:**
```bash
# Delete table in dashboard
# Copy-paste entire SQL file
# Hope nothing breaks
```

✅ **Do this:**
```sql
-- Create migration file: 20241101000003_fix_something.sql
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Update existing records if needed
UPDATE public.job_applications 
SET new_field = 'default_value' 
WHERE new_field IS NULL;
```

### 2. Version Control Your Schema

- Keep all schema changes in migration files
- Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
- Never edit old migration files - create new ones

### 3. Test Locally First

```bash
# Test your changes
npm run dev

# Check for TypeScript errors
npm run build

# Test database operations
node scripts/dev-setup.js check
```

### 4. Backup Before Major Changes

```sql
-- Create backup table
CREATE TABLE job_applications_backup AS 
SELECT * FROM public.job_applications;

-- After testing, drop backup
DROP TABLE job_applications_backup;
```

## 🐛 Troubleshooting Common Issues

### Policy Violations

**Error:** `new row violates row-level security policy`

**Solution:**
```sql
-- Check if user_id is being set correctly
SELECT auth.uid(); -- Should return your user ID

-- Ensure policy allows the operation
CREATE POLICY "Users can insert their own applications" ON public.job_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Constraint Violations

**Error:** `violates check constraint`

**Solution:**
```sql
-- Check constraint details
SELECT * FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%job_applications%';

-- Fix data or update constraint
ALTER TABLE public.job_applications 
DROP CONSTRAINT constraint_name;
```

### Function/Trigger Issues

**Error:** `function does not exist` or `trigger does not exist`

**Solution:**
```sql
-- Recreate function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS handle_updated_at_job_applications ON public.job_applications;
CREATE TRIGGER handle_updated_at_job_applications
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### JSON Field Issues

**Error:** `invalid input syntax for type json`

**Solution:**
```sql
-- Check JSON validity
SELECT id, "techStack" 
FROM public.job_applications 
WHERE "techStack" IS NOT NULL 
AND NOT ("techStack"::text ~ '^[\[\{].*[\]\}]$');

-- Fix invalid JSON
UPDATE public.job_applications 
SET "techStack" = '[]'::jsonb 
WHERE "techStack" IS NULL OR "techStack"::text = '';
```

## 📦 Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "dev:setup": "node scripts/dev-setup.js setup",
    "dev:check": "node scripts/dev-setup.js check",
    "dev:reset": "node scripts/dev-setup.js reset",
    "dev:migrate": "node scripts/dev-setup.js migrate"
  }
}
```

## 🚀 Production Deployment

1. **Environment Variables**
   - Add all env vars to Vercel/Netlify
   - Use production Supabase project

2. **Run Migrations**
   - Apply all migration files to production
   - Test thoroughly in staging first

3. **Monitor**
   - Check Supabase logs
   - Monitor application errors
   - Set up alerts for policy violations

## 📚 Best Practices

1. **Always use migrations** for schema changes
2. **Test locally** before deploying
3. **Keep backups** of important data
4. **Use descriptive names** for migrations
5. **Document breaking changes** in migration comments
6. **Never edit production data** directly
7. **Use transactions** for complex migrations
8. **Test rollback procedures** when possible

## 🆘 Emergency Procedures

### Complete Reset (Last Resort)

1. **Backup Data**
   ```sql
   -- Export important data first
   COPY (SELECT * FROM public.job_applications) TO '/tmp/backup.csv' CSV HEADER;
   ```

2. **Reset Schema**
   ```bash
   node scripts/dev-setup.js reset
   # Run the generated SQL in Supabase dashboard
   ```

3. **Reapply Migrations**
   ```bash
   # Run each migration file in order
   node scripts/dev-setup.js migrate
   ```

4. **Restore Data** (if needed)
   ```sql
   -- Import data back
   COPY public.job_applications FROM '/tmp/backup.csv' CSV HEADER;
   ```

This workflow will save you hours of debugging and make your development process much smoother! 🎉