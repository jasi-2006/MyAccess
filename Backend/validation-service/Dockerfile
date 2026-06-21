FROM python:3.10-slim

WORKDIR /app

# Install Chromium and Chromium driver dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 5005

CMD ["python", "app.py"]
