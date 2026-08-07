Wow & Amazing — Phase 6 Package Lock Hotfix

This hotfix replaces the Phase 6 package-lock.json that contained internal registry URLs with a lockfile using the public npm registry.

After merging this ZIP into the project, run from Windows CMD:

cd /d "%USERPROFILE%\Desktop\Wow-and-Amazing"
taskkill /F /IM node.exe 2>nul
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
npm cache verify
npm ci --registry=https://registry.npmjs.org/
npm run lint
npx tsc --noEmit
npm run build
npm run dev
