@echo off
echo Did you update the version number and prepare to release?
set /p ans=
if /i not %ans% == y (pause && exit)

cd "C:\Users\xyz11\OneDrive - University of Manchester\Programme\web"
zip -r UoMBbEn/UoMBbEn.zip UoMBbEn/ -x **/.git/* **/preview/* **/.gitignore **/changelog.md **/ideas.txt **/pack.bat **/UoMBbEn.zip
cd UoMBbEn

pause
