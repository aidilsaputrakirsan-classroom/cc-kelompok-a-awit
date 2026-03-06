#!/bin/bash

echo "Starting project setup..."

echo "Creating Python virtual environment..."
python -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "Setup completed!"
echo "Run backend with:"
echo "uvicorn backend.main:app --reload"