from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.crud import FactureGlobale, documents, workspace
from app.utils.file_handlers import extract_bl_numbers_from_facture, extract_text_from_pdf
from PIL import Image
import pytesseract
import os
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/workspaces/{workspace_id}/check-facture-in-bl")

async def check_bl_in_facture(
    facture_file: UploadFile = File(...),
    bl_files: List[UploadFile] = File(...)
):
    # Vérifier la présence des fichiers
    if not facture_file or not bl_files:
        raise HTTPException(status_code=400, detail="Veuillez déposer la facture globale et les bons de livraison.")

    # OCR sur la facture globale
    facture_bytes = await facture_file.read()
    facture_text = extract_text_from_pdf(facture_bytes)
    bl_numbers = extract_bl_numbers_from_facture(facture_text)
    if not bl_numbers:
        raise HTTPException(status_code=400, detail="Aucun numéro de BL détecté après le nom du fournisseur dans la facture.")

    # Lire tous les BL uploadés
    bl_texts = []
    for bl_file in bl_files:
        bl_bytes = await bl_file.read()
        bl_texts.append(extract_text_from_pdf(bl_bytes).replace(" ", ""))

    # Chercher chaque numéro de BL dans les fichiers BL
    results = []
    for bl_number in bl_numbers:
        found = any(bl_number.replace(" ", "") in bl_text for bl_text in bl_texts)
        results.append({
            "bl_number": bl_number,
            "found_in_documents": found
        })

    return {
        "facture_file": facture_file.filename,
        "bl_numbers_detected": bl_numbers,
        "results": results
    }
