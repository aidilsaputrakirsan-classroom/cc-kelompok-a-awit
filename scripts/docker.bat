@echo off
REM Docker Management Script for CloudApp (Windows Batch)
REM Lead CI/CD: Simplify Docker operations for backend and frontend
REM Usage: scripts\docker.bat <command> [options]

setlocal enabledelayedexpansion

REM Configuration
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=your-dockerhub-username
if "%TAG%"=="" set TAG=v1
set BACKEND_IMAGE=%DOCKER_USERNAME%/cloudapp-backend
set FRONTEND_IMAGE=%DOCKER_USERNAME%/cloudapp-frontend

REM Colors (using color codes)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:log_info
echo [94m[INFO][0m %~1
goto :eof

:log_success
echo [92m[SUCCESS][0m %~1
goto :eof

:log_warning
echo [93m[WARNING][0m %~1
goto :eof

:log_error
echo [91m[ERROR][0m %~1
goto :eof

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker is not installed or not in PATH"
    exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker daemon is not running"
    exit /b 1
)
goto :eof

:build_backend
call :log_info "Building backend image..."
cd backend
docker build -t %BACKEND_IMAGE%:%TAG% .
if errorlevel 1 (
    call :log_error "Failed to build backend image"
    cd ..
    exit /b 1
)
call :log_success "Backend image built: %BACKEND_IMAGE%:%TAG%"
cd ..
goto :eof

:build_frontend
call :log_info "Building frontend image..."
cd frontend
docker build -t %FRONTEND_IMAGE%:%TAG% .
if errorlevel 1 (
    call :log_error "Failed to build frontend image"
    cd ..
    exit /b 1
)
call :log_success "Frontend image built: %FRONTEND_IMAGE%:%TAG%"
cd ..
goto :eof

:run_backend
call :log_info "Running backend container..."
if not exist "backend\.env" (
    call :log_warning "backend\.env not found. Please create it with database configuration."
)
docker run -d --name backend -p 8000:8000 --env-file backend/.env %BACKEND_IMAGE%:%TAG%
if errorlevel 1 (
    call :log_error "Failed to run backend container"
    exit /b 1
)
call :log_success "Backend container started on port 8000"
goto :eof

:run_frontend
call :log_info "Running frontend container..."
docker run -d --name frontend -p 3000:80 %FRONTEND_IMAGE%:%TAG%
if errorlevel 1 (
    call :log_error "Failed to run frontend container"
    exit /b 1
)
call :log_success "Frontend container started on port 3000"
goto :eof

:push_backend
if "%DOCKER_USERNAME%"=="your-dockerhub-username" (
    call :log_error "Please set DOCKER_USERNAME environment variable"
    call :log_info "Example: set DOCKER_USERNAME=myuser && scripts\docker.bat push-backend"
    exit /b 1
)
call :log_info "Pushing backend image to Docker Hub..."
docker push %BACKEND_IMAGE%:%TAG%
if errorlevel 1 (
    call :log_error "Failed to push backend image"
    exit /b 1
)
call :log_success "Backend image pushed: %BACKEND_IMAGE%:%TAG%"
goto :eof

:push_frontend
if "%DOCKER_USERNAME%"=="your-dockerhub-username" (
    call :log_error "Please set DOCKER_USERNAME environment variable"
    call :log_info "Example: set DOCKER_USERNAME=myuser && scripts\docker.bat push-frontend"
    exit /b 1
)
call :log_info "Pushing frontend image to Docker Hub..."
docker push %FRONTEND_IMAGE%:%TAG%
if errorlevel 1 (
    call :log_error "Failed to push frontend image"
    exit /b 1
)
call :log_success "Frontend image pushed: %FRONTEND_IMAGE%:%TAG%"
goto :eof

:clean
call :log_info "Stopping containers..."
docker stop backend frontend 2>nul

call :log_info "Removing containers..."
docker rm backend frontend 2>nul

call :log_info "Removing images..."
docker rmi %BACKEND_IMAGE%:%TAG% %FRONTEND_IMAGE%:%TAG% 2>nul

call :log_info "Cleaning up dangling resources..."
docker system prune -f

call :log_success "Cleanup completed"
goto :eof

:logs_backend
docker logs -f backend
goto :eof

:logs_frontend
docker logs -f frontend
goto :eof

:shell_backend
docker exec -it backend bash
goto :eof

:shell_frontend
docker exec -it frontend sh
goto :eof

:status
echo === Docker Containers ===
docker ps -a --filter "name=backend" --filter "name=frontend"

echo.
echo === Docker Images ===
docker images | findstr "%DOCKER_USERNAME% cloudapp"

echo.
echo === Docker System ===
docker system df
goto :eof

:show_help
echo Docker Management Script for CloudApp (Windows)
echo.
echo Usage: %0 ^<command^> [options]
echo.
echo Commands:
echo   build          - Build both backend and frontend images
echo   build-backend  - Build backend image
echo   build-frontend - Build frontend image
echo   run            - Run both containers
echo   run-backend    - Run backend container
echo   run-frontend   - Run frontend container
echo   push           - Push both images to Docker Hub
echo   push-backend   - Push backend image
echo   push-frontend  - Push frontend image
echo   clean          - Stop and remove containers, remove images
echo   logs-backend   - Show backend container logs
echo   logs-frontend  - Show frontend container logs
echo   shell-backend  - Open shell in backend container
echo   shell-frontend - Open shell in frontend container
echo   status         - Show status of containers and images
echo   help           - Show this help message
echo.
echo Environment Variables:
echo   DOCKER_USERNAME - Your Docker Hub username (required for push)
echo   TAG             - Image tag (default: v1)
echo.
echo Examples:
echo   %0 build
echo   set DOCKER_USERNAME=myuser ^& %0 push
echo   %0 run-backend
echo   %0 clean
goto :eof

REM Main script
call :check_docker

if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

if "%1"=="build" (
    call :build_backend
    call :build_frontend
) else if "%1"=="build-backend" (
    call :build_backend
) else if "%1"=="build-frontend" (
    call :build_frontend
) else if "%1"=="run" (
    call :run_backend
    call :run_frontend
) else if "%1"=="run-backend" (
    call :run_backend
) else if "%1"=="run-frontend" (
    call :run_frontend
) else if "%1"=="push" (
    call :push_backend
    call :push_frontend
) else if "%1"=="push-backend" (
    call :push_backend
) else if "%1"=="push-frontend" (
    call :push_frontend
) else if "%1"=="clean" (
    call :clean
) else if "%1"=="logs-backend" (
    call :logs_backend
) else if "%1"=="logs-frontend" (
    call :logs_frontend
) else if "%1"=="shell-backend" (
    call :shell_backend
) else if "%1"=="shell-frontend" (
    call :shell_frontend
) else if "%1"=="status" (
    call :status
) else (
    call :log_error "Unknown command: %1"
    echo.
    goto show_help
)