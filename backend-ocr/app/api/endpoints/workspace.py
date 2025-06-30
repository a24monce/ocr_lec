from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.crud import FactureGlobale, documents, workspace
from app.utils.file_handlers import extract_bl_numbers_from_facture, extract_text_from_pdf
from PIL import Image
import pytesseract
import os
from datetime import datetime

router = APIRouter()

@router.post("/workspaces/{workspace_id}/check-facture-in-bl")
async def check_facture_in_bl(
    workspace_id: int,
    db: Session = Depends(get_db)
):
    # Vérifier workspace et facture
    workspace = workspace.get_workspace(db, workspace_id=workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    facture_globale = FactureGlobale.get_facture_globale_by_workspace(db, workspace_id=workspace_id)
    if not facture_globale:
        raise HTTPException(status_code=400, detail="Aucune facture globale trouvée")

    # Extraire les numéros de BL de la facture
    with open(facture_globale.file_path, 'rb') as f:
        facture_bytes = f.read()
    bl_numbers = extract_bl_numbers_from_facture(facture_bytes)

    if not bl_numbers:
        raise HTTPException(status_code=400, detail="Aucun numéro de BL détecté dans la facture")

    # Parcourir les documents (bons de livraison) et chercher les BL
    documents = document.get_documents_by_workspace(db, workspace_id=workspace_id)
    results = []

    for bl_number in bl_numbers:
        found = False
        for document in documents:
            with open(document.file_path, 'rb') as f:
                bl_text = extract_text_from_pdf(f.read()).replace(" ", "")
                if bl_number.replace(" ", "") in bl_text:
                    found = True
                    break
        results.append({
            "bl_number": bl_number,
            "found_in_documents": found
        })

    return {
        "facture_file": facture_globale.original_filename,
        "bl_numbers_detected": bl_numbers,
        "results": results
    }