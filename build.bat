@echo off
taskkill /f /im WeeklyPlanner.exe
electron-packager .\ WeeklyPlanner --platform=win32 --arch=x64 --overwrite
