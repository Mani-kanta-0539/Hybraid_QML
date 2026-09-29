# ==============================================================================
# HealthQure Production Dockerfile (Backend Inference Service)
# Suitable for Render, Railway, Hugging Face Spaces, or GCP Cloud Run
# ==============================================================================

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and scientific computing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU wheel first to optimize build time and avoid CUDA bloat
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and checkpoints
COPY api/ api/
COPY src/ src/
COPY checkpoints/ checkpoints/
COPY data/sample_images/ data/sample_images/
COPY data/alzheimers/ data/alzheimers/

# Expose FastAPI port
EXPOSE 8000

# Start Uvicorn production server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
