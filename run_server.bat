@echo off
rem Run a simple static file server for Rockview Sports
rem Requires Node.js and npx. This script will serve the current directory on port 3000.

echo Starting static server on http://localhost:3000/ ...
npx serve -l 3000 .
