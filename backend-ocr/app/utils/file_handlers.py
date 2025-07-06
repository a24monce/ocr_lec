from PIL import Image
import pytesseract
import re
from pdf2image import convert_from_bytes
from typing import List

# --- Fonction d'extraction des références depuis un PDF ---
def extract_references_from_pdf(file_bytes: bytes) -> set:
    references = set()
    images = convert_from_bytes(file_bytes)
    for image in images:
        text = pytesseract.image_to_string(image)
        refs = extract_references_from_text(text)
        references.update(refs)
    return references

# --- Fonction d'extraction des références depuis du texte brut ---
def extract_references_from_text(text: str) -> set:
    pattern = r"\b[0O]?[A-Z]{2,3}[A-Z0-9\s/-]{5,25}\b"
    lines = text.splitlines()
    references = set()
    for line in lines:
        matches = re.findall(pattern, line)
        for ref in matches:
            cleaned = ref.strip().replace("–", "-")
            if len(cleaned) >= 8:
                references.add(cleaned)
    return references

# --- Fonction d'extraction des numéros de BL depuis une facture ---
def extract_bl_numbers_from_facture(text: str) -> List[str]:
    bl_numbers = []
    pattern = r"(KERING EYEWEAR|LUXOTTICA)[^\d]*(\d{8,12})"
    for line in text.splitlines():
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            bl_numbers.append(match.group(2))
    return bl_numbers

# --- Fonction d'extraction OCR brut depuis un PDF ---
def extract_text_from_pdf(file_bytes: bytes) -> str:
    images = convert_from_bytes(file_bytes)
    text = "\n".join([pytesseract.image_to_string(image) for image in images])
    return text 