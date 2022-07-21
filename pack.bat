@echo off
echo Did you update the version number and prepare to release?
set /p ans=
if /i not %ans% == y (pause && exit)
del UoMBbEn.zip
cd ..
zip -r UoMBbEn/UoMBbEn.zip UoMBbEn/ -x **/.git/* **/preview/* **/.gitignore **/changelog.md **/ideas.txt **/pack.bat
cd UoMBbEn
echo Packing completed
pause
