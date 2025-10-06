@echo off
echo Starting Celebre Backend API...
echo.

cd src\Celebre.Api

echo Running database migrations...
dotnet ef database update --project ..\Celebre.Infrastructure --startup-project .

echo.
echo Starting API server...
dotnet run

pause
