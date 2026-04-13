#!/bin/bash

# Docker Management Script for CloudApp
# Lead CI/CD: Simplify Docker operations for backend and frontend
# Usage: ./scripts/docker.sh <command> [options]

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-your-dockerhub-username}"
BACKEND_IMAGE="$DOCKER_USERNAME/cloudapp-backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/cloudapp-frontend"
TAG="${TAG:-v1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Docker Management Script for CloudApp"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  build          - Build both backend and frontend images"
    echo "  build-backend  - Build backend image"
    echo "  build-frontend - Build frontend image"
    echo "  run            - Run both containers"
    echo "  run-backend    - Run backend container"
    echo "  run-frontend   - Run frontend container"
    echo "  push           - Push both images to Docker Hub"
    echo "  push-backend   - Push backend image"
    echo "  push-frontend  - Push frontend image"
    echo "  clean          - Stop and remove containers, remove images"
    echo "  logs-backend   - Show backend container logs"
    echo "  logs-frontend  - Show frontend container logs"
    echo "  shell-backend  - Open shell in backend container"
    echo "  shell-frontend - Open shell in frontend container"
    echo "  status         - Show status of containers and images"
    echo "  help           - Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DOCKER_USERNAME - Your Docker Hub username (required for push)"
    echo "  TAG             - Image tag (default: v1)"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  DOCKER_USERNAME=myuser $0 push"
    echo "  $0 run-backend"
    echo "  $0 clean"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
}

build_backend() {
    log_info "Building backend image..."
    cd backend
    docker build -t "$BACKEND_IMAGE:$TAG" .
    log_success "Backend image built: $BACKEND_IMAGE:$TAG"
    cd ..
}

build_frontend() {
    log_info "Building frontend image..."
    cd frontend
    docker build -t "$FRONTEND_IMAGE:$TAG" .
    log_success "Frontend image built: $FRONTEND_IMAGE:$TAG"
    cd ..
}

run_backend() {
    log_info "Running backend container..."
    if [ ! -f "backend/.env" ]; then
        log_warning "backend/.env not found. Please create it with database configuration."
    fi
    docker run -d --name backend -p 8000:8000 --env-file backend/.env "$BACKEND_IMAGE:$TAG"
    log_success "Backend container started on port 8000"
}

run_frontend() {
    log_info "Running frontend container..."
    docker run -d --name frontend -p 3000:80 "$FRONTEND_IMAGE:$TAG"
    log_success "Frontend container started on port 3000"
}

push_backend() {
    if [ "$DOCKER_USERNAME" = "your-dockerhub-username" ]; then
        log_error "Please set DOCKER_USERNAME environment variable"
        log_info "Example: DOCKER_USERNAME=myuser $0 push-backend"
        exit 1
    fi
    log_info "Pushing backend image to Docker Hub..."
    docker push "$BACKEND_IMAGE:$TAG"
    log_success "Backend image pushed: $BACKEND_IMAGE:$TAG"
}

push_frontend() {
    if [ "$DOCKER_USERNAME" = "your-dockerhub-username" ]; then
        log_error "Please set DOCKER_USERNAME environment variable"
        log_info "Example: DOCKER_USERNAME=myuser $0 push-frontend"
        exit 1
    fi
    log_info "Pushing frontend image to Docker Hub..."
    docker push "$FRONTEND_IMAGE:$TAG"
    log_success "Frontend image pushed: $FRONTEND_IMAGE:$TAG"
}

clean() {
    log_info "Stopping containers..."
    docker stop backend frontend 2>/dev/null || true
    docker rm backend frontend 2>/dev/null || true

    log_info "Removing images..."
    docker rmi "$BACKEND_IMAGE:$TAG" "$FRONTEND_IMAGE:$TAG" 2>/dev/null || true

    log_info "Cleaning up dangling resources..."
    docker system prune -f

    log_success "Cleanup completed"
}

logs_backend() {
    docker logs -f backend
}

logs_frontend() {
    docker logs -f frontend
}

shell_backend() {
    docker exec -it backend bash
}

shell_frontend() {
    docker exec -it frontend sh
}

status() {
    echo "=== Docker Containers ==="
    docker ps -a --filter "name=backend" --filter "name=frontend"

    echo ""
    echo "=== Docker Images ==="
    docker images | grep -E "($DOCKER_USERNAME|cloudapp)"

    echo ""
    echo "=== Docker System ==="
    docker system df
}

# Main script
check_docker

case "${1:-help}" in
    build)
        build_backend
        build_frontend
        ;;
    build-backend)
        build_backend
        ;;
    build-frontend)
        build_frontend
        ;;
    run)
        run_backend
        run_frontend
        ;;
    run-backend)
        run_backend
        ;;
    run-frontend)
        run_frontend
        ;;
    push)
        push_backend
        push_frontend
        ;;
    push-backend)
        push_backend
        ;;
    push-frontend)
        push_frontend
        ;;
    clean)
        clean
        ;;
    logs-backend)
        logs_backend
        ;;
    logs-frontend)
        logs_frontend
        ;;
    shell-backend)
        shell_backend
        ;;
    shell-frontend)
        shell_frontend
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac