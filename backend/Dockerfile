FROM python:3.11-slim-bookworm

# Install minimal runtime libraries for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Point writeable cache paths to /tmp so user namespaces never block them
ENV YOLO_CONFIG_DIR=/tmp/Ultralytics
ENV MPLCONFIGDIR=/tmp/matplotlib
ENV HOME=/tmp

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the YOLO pose weights during build
RUN python3 -c "from ultralytics import YOLO; YOLO('yolo26n-pose.pt')"

# Create the storage directory and give full write access inside the image
RUN mkdir -p /app/videos /tmp/Ultralytics /tmp/matplotlib && \
    chmod -R 777 /app/videos /tmp

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
