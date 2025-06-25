from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import re
from pdf2image import convert_from_bytes
from fastapi import HTTPException
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# --- Fonction d'extraction du numéro de BL ---
def extract_bl_number_from_pdf(file_bytes: bytes) -> str:
    images = convert_from_bytes(file_bytes)

    for image in images:
        text = pytesseract.image_to_string(image)
        lines = text.splitlines()

        # Cas spécifique Luxottica
        if "luxottica" in text.lower():
            for line in lines:
                match = re.search(
                    r'N\s*(?:Bolla|bordereau)(?:\s*/\s*(?:N\s*)?(?:Bolla|bordereau))?[^\d]{0,10}(\d{8,12})',
                    line,
                    re.IGNORECASE
                )
                if match:
                    return match.group(1)

        # Fallback générique
        for line in lines:
            match = re.search(r"(BL[\s\-:]*N?[°º]?\s*:?[\s\-]*([A-Z0-9\-]{5,}))", line, re.IGNORECASE)
            if match:
                return match.group(2).strip()

            match2 = re.search(r"\b\d{10,12}\b", line)
            if match2:
                return match2.group(0)

        match3 = re.search(r"(BL[\s\-:]*N?[°º]?\s*:?[\s\-]*([A-Z0-9\-]{5,}))", text, re.IGNORECASE)
        if match3:
            return match3.group(2).strip()

        match4 = re.search(r"\b\d{10,12}\b", text)
        if match4:
            return match4.group(0)

    return None

# --- Endpoint principal ---
@app.post("/check_bl_in_facture")
async def check_bl_in_facture(
    bl_files: List[UploadFile] = File(...),
    facture_file: UploadFile = File(...)
):
    # Lecture de la facture
    facture_bytes = await facture_file.read()
    images = convert_from_bytes(facture_bytes) if facture_file.filename.lower().endswith(".pdf") else [Image.open(facture_file.file)]

    # Extraction et vérification pour chaque fichier BL
    results = []
    for bl_file in bl_files:
        bl_bytes = await bl_file.read()
        bl_number = extract_bl_number_from_pdf(bl_bytes)

        if not bl_number:
            result = {
                "filename": bl_file.filename,
                "bl_number": None,
                "found_in_facture": False,
                "error": "Numéro de BL non trouvé"
            }
        else:
            bl_number_clean = bl_number.replace(" ", "")
            found = any(
                bl_number_clean in pytesseract.image_to_string(img).replace(" ", "")
                for img in images
            )
            result = {
                "filename": bl_file.filename,
                "bl_number": bl_number,
                "found_in_facture": found
            }

        results.append(result)

    return results
