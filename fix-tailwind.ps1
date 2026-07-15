# fix-tailwind.ps1
Write-Host "Fixing Tailwind CSS configuration for Vite..." -ForegroundColor Green

# Rename postcss.config.js to postcss.config.cjs
if (Test-Path "postcss.config.js") {
    Write-Host "Renaming postcss.config.js to postcss.config.cjs..." -ForegroundColor Yellow
    Rename-Item -Path "postcss.config.js" -NewName "postcss.config.cjs" -Force
}

# Create/Update tailwind.config.js with ES module syntax
Write-Host "Updating tailwind.config.js..." -ForegroundColor Yellow
@"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@ | Out-File -FilePath tailwind.config.js -Encoding utf8 -Force

# Create/Update postcss.config.cjs
Write-Host "Updating postcss.config.cjs..." -ForegroundColor Yellow
@"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@ | Out-File -FilePath postcss.config.cjs -Encoding utf8 -Force

# Ensure index.css has Tailwind directives
Write-Host "Updating src/index.css..." -ForegroundColor Yellow
@"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@ | Out-File -FilePath src/index.css -Encoding utf8 -Force

Write-Host "Fix complete! Restart your dev server: npm run dev" -ForegroundColor Green