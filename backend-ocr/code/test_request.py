import requests

url = "http://localhost:8000/ocr-pdf"
file_path = "/Users/amalmoncer/Downloads/DS.pdf"

with open(file_path, "rb") as f:
    files = {"file": (file_path, f, "application/pdf")}
    response = requests.post(url, files=files)

print("📄 Texte extrait :")
print(response.json()["extracted_text"])
