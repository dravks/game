@echo off
cd /d %~dp0
start http://localhost:4173/dungeon-editor.html
npx serve . -l 4173
pause
