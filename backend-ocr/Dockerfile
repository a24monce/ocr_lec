FROM python:3.11-slim

# Installer les dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y poppler-utils tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers de dépendances Python
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
