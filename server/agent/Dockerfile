FROM python:3.12-slim

WORKDIR /app

# Install Python deps first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

CMD ["python", "-m", "worker.worker"]
