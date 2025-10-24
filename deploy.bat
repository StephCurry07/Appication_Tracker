@echo off
echo 🚀 Deploying Job Application Tracker to Vercel...

echo 📦 Building project...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    echo 🌐 Deploying to Vercel...
    call vercel --prod
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
    ) else (
        echo ❌ Deployment failed!
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    exit /b 1
)