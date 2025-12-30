# Use the official Playwright Python image (includes browsers & OS deps)
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app code
COPY . .

# Run the application (Adjust main:app if your file isn't named main.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
