import pytesseract
import re
from pdf2image import convert_from_bytes
from typing import List
import os

def extract_references_from_pdf(file_bytes: bytes) -> set:
    """Extrait les références depuis un PDF (en bytes) via OCR sur chaque page."""
    references = set()
    images = convert_from_bytes(file_bytes)
    for image in images:
        text = pytesseract.image_to_string(image)
        refs = extract_references_from_text(text)
        references.update(refs)
    return references

def extract_references_from_text(text: str) -> set:
    """Extrait les références depuis du texte brut."""
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

def extract_bl_numbers_from_facture(file_bytes: bytes) -> List[str]:
    """Extrait les numéros de BL depuis un PDF de facture (en bytes) via OCR."""
    images = convert_from_bytes(file_bytes)
    bl_numbers = set()
    for image in images:
        text = pytesseract.image_to_string(image)
        lines = text.splitlines()
        for line in lines:
            if "LUXOTTICA" in line.lower() or "KERING" in line.lower() or "THELIOS" in line.lower() or "MARCOLIN" in line.lower():
                match = re.search(r"\b\d{8,12}\b", line)
                if match:
                    bl_numbers.add(match.group(0))
    return list(bl_numbers)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extrait le texte OCR brut depuis un PDF (en bytes)."""
    images = convert_from_bytes(file_bytes)
    text = "\n".join([pytesseract.image_to_string(image) for image in images])
    return text 

def extract_bl_numbers(text: str) -> List[str]:
    """Extrait tous les numéros de BL après KERING EYEWEAR ou LUXOTTICA ou THELIOS dans un texte brut """
    matches = re.findall(r'(EYEWEAR|LUXOTTICA|THELIOS|MARCOLIN)\D*(\d{6,10})', text, flags=re.IGNORECASE)
    bl_numbers = [m[1] for m in matches]
    return bl_numbers

def extract_bl_numbers2(text: str) -> List[str]:
    """Extrait tous les numéros de BL depuis un bon de livraison en cherchant les motifs spécifiques.
    Traite toutes les pages du PDF et extrait tous les numéros de BL trouvés."""
    bl_numbers = set()
    
    # Pattern 1: "N.du bon de livraison" ou "N du bon de livraison" suivi d'un numéro
    # Plus flexible pour gérer les variations OCR (espaces, points, etc.)
    pattern1 = r'(?:N\.?\s*du\s+bon\s+de\s+livraison|N\.?\s*du\s+bon\s+de\s+livraison)[\s|:]*(\d{8,12})'
    matches1 = re.findall(pattern1, text, flags=re.IGNORECASE)
    bl_numbers.update(matches1)
    
    # Pattern 2: "N Bolla/N bordereau" ou "N Bolis/N bordereau" suivi d'un numéro
    # Gère les variations avec ou sans slash (Bolla = italien, Bolis = français)
    pattern2 = r'(?:N\s+Bolla[\/\s]*N\s+bordereau|N\s+Bolis[\/\s]*N\s+bordereau|N\s+Bolla|N\s+Bolis|N\s+bordereau)[\s|:]*(\d{8,12})'
    matches2 = re.findall(pattern2, text, flags=re.IGNORECASE)
    bl_numbers.update(matches2)
    
    # Pattern 3: "Bon de Livr." ou "Bon livraison" suivi d'un numéro
    pattern3 = r'(?:Bon\s+de\s+Livr\.?|Bon\s+livraison|Bon\s+de\s+livraison)[\s|:]*(\d{8,12})'
    matches3 = re.findall(pattern3, text, flags=re.IGNORECASE)
    bl_numbers.update(matches3)
    
    # Pattern 4: Recherche plus large - cherche "livraison" ou "bordereau" suivi d'un numéro dans un contexte de table
    # Ce pattern est plus permissif pour capturer les numéros même si le format exact varie
    pattern4 = r'(?:bordereau|livraison|Livr\.?)[\s|:]*(\d{6,12})'
    matches4 = re.findall(pattern4, text, flags=re.IGNORECASE)
    bl_numbers.update(matches4)
    
    # Pattern 5: Recherche de numéros de 8-12 chiffres près des mots-clés (fallback robuste)
    # Cherche les numéros dans les lignes contenant des mots-clés de bon de livraison
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in ['livraison', 'bordereau', 'bolla', 'bolis', 'bon de livr']):
            # Cherche un numéro de 8-12 chiffres dans cette ligne
            numbers = re.findall(r'\b(\d{8,12})\b', line)
            bl_numbers.update(numbers)
    
    return list(bl_numbers)

