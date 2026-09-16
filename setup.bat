@echo off
REM ========================================================================
REM   The Extraction CTF Platform
REM   Initial Setup and Full Database Reset Wrapper
REM ========================================================================

setlocal enabledelayedexpansion

echo.
echo  ====================================================================
echo    The Extraction -- INITIAL SETUP AND FULL DATABASE RESET
echo    WARNING: This will erase all teams, submissions, and scores!
echo  ====================================================================
echo.

set /p "CONFIRM=This will DELETE all existing data and re-seed. Type YES to continue: "
if /i "!CONFIRM!" NEQ "YES" (
    echo.
    echo  [ABORTED] Setup cancelled. No changes made.
    pause
    exit /b 0
)

call "%~dp0start.bat" --reset
