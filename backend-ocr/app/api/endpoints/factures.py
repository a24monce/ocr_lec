from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
import os
from app.schemas.workspaces import WorkspaceCreate, Workspace as WorkspaceSchema, WorkspaceUpdate
from app.utils.file_handlers import extract_text_from_pdf, extract_bl_numbers, extract_bl_numbers2

router = APIRouter(prefix="/workspaces", tags=["factures"])

# Dossier principal "uploads" dans backend-ocr/uploads
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/{workspace_id}/check-facture-in-bl")
async def check_facture_in_bl(workspace_id: int):
    # --- 1. Définir les chemins
    facture_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "facture")
    bl_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "bl")

    # --- 2. Vérifier l'existence des dossiers
    if not os.path.exists(facture_folder):
        raise HTTPException(status_code=404, detail="Aucune facture globale trouvée pour ce workspace.")
    if not os.path.exists(bl_folder):
        raise HTTPException(status_code=404, detail="Aucun bon de livraison trouvé pour ce workspace.")

    # --- 3. Charger la facture globale
    facture_files = [f for f in os.listdir(facture_folder) if f.lower().endswith(".pdf")]
    if not facture_files:
        raise HTTPException(status_code=404, detail="Aucune facture PDF trouvée dans le dossier facture.")

    facture_path = os.path.join(facture_folder, facture_files[0])
    with open(facture_path, "rb") as f:
        facture_bytes = f.read()

    # Extraire texte et numéros BL de la facture
    facture_text = extract_text_from_pdf(facture_bytes).replace(" ", "")
    bl_numbers_raw = extract_bl_numbers(facture_text)
    # Normaliser les numéros (enlever espaces, garder uniquement les chiffres)
    bl_numbers = [bl.replace(" ", "").strip() for bl in bl_numbers_raw if bl.replace(" ", "").strip()]

    if not bl_numbers:
        raise HTTPException(status_code=400, detail="Aucun numéro de BL détecté dans la facture globale.")

    # --- 4. Charger tous les BL une seule fois
    bl_texts = []
    for filename in os.listdir(bl_folder):
        if filename.lower().endswith(".pdf"):
            bl_path = os.path.join(bl_folder, filename)
            with open(bl_path, "rb") as f:
                content = f.read()
            # ✅ extraire texte une seule fois et normaliser
            text = extract_text_from_pdf(content).replace(" ", "")
            # ✅ extraire les BL présents dans ce doc et normaliser
            bl_in_doc_raw = extract_bl_numbers2(text)
            bl_in_doc = set([bl.replace(" ", "").strip() for bl in bl_in_doc_raw if bl.replace(" ", "").strip()])
            bl_texts.append((filename, bl_in_doc, text))  # Garder aussi le texte pour recherche flexible

    # --- 5. Vérifier la présence avec comparaison robuste
    results = []
    for bl in bl_numbers:
        found = False
        # Méthode 1: Comparaison exacte dans les sets de numéros extraits
        for filename, bl_doc_set, text_normalized in bl_texts:
            if bl in bl_doc_set:
                found = True
                break
        
        # Méthode 2: Si pas trouvé, chercher dans le texte normalisé (plus flexible pour variations OCR)
        if not found:
            for filename, bl_doc_set, text_normalized in bl_texts:
                if bl in text_normalized:
                    found = True
                    break
        
        results.append({
            "bl_number": bl,
            "found_in_documents": found
        })

    bl_manquants = [r["bl_number"] for r in results if not r["found_in_documents"]]

    # Formater "les bl" pour l'affichage
    les_bl_formatted = [[filename, list(bl_doc_set)] for filename, bl_doc_set, _ in bl_texts]

    return {
        "Les numéros de BL détectés dans la facture globale": bl_numbers,
        "Les bons de livraison présents": [r["bl_number"] for r in results if r["found_in_documents"]],
        "Il manque": len(bl_manquants),
        "Bons de livraison manquants": bl_manquants,
        "les bl": les_bl_formatted
    }


@router.post("/{workspace_id}/bl/")
async def upload_document(workspace_id: int, file: UploadFile, db: Session = Depends(get_db)):
    """Upload un bon de livraison (BL) pour un workspace"""

    # chemin
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "bl")
    os.makedirs(workspace_folder, exist_ok=True)

    # Sauvegarder le fichier
    file_path = os.path.join(workspace_folder, file.filename)
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {
        "message": f"Document {file.filename} uploadé avec succès",
        "workspace_id": workspace_id,
        "path": file_path
    }

@router.post("/{workspace_id}/facture-globale/")
async def upload_facture_globale(workspace_id: int, file: UploadFile, db: Session = Depends(get_db)):
    """Upload une facture globale pour un workspace"""

    # Chemin du dossier facture
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "facture")
    os.makedirs(workspace_folder, exist_ok=True)
    
    # --- Vérifier et supprimer l'ancienne facture
    existing_files = [f for f in os.listdir(workspace_folder) if f.lower().endswith(".pdf")]
    if existing_files:
        for old_file in existing_files:
            os.remove(os.path.join(workspace_folder, old_file))

    # --- Sauvegarder la nouvelle facture
    file_path = os.path.join(workspace_folder, file.filename)
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {
        "message": f"Facture globale {file.filename} uploadée avec succès (ancienne facture remplacée si elle existait).",
        "workspace_id": workspace_id
    }

@router.delete("/{workspace_id}/facture-globale/{filename}")
async def supprimer_facture_globale(workspace_id: int, filename: str, db: Session = Depends(get_db)):
    """Supprimer une facture spécifique d'un workspace"""

    # Chemin du dossier facture
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "facture")
    file_path = os.path.join(workspace_folder, filename)

    # Vérifier l'existence du fichier
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Le fichier {filename} n'existe pas dans ce workspace.")

    # Supprimer le fichier
    os.remove(file_path)

    return {
        "message": f"Facture {filename} supprimée avec succès du workspace {workspace_id}.",
        "workspace_id": workspace_id
    }


@router.delete("/{workspace_id}/bl/{filename}")
async def supprimer_bl(workspace_id: int, filename: str, db: Session = Depends(get_db)):
    """Supprimer un bon de livraison spécifique d'un workspace"""

    # Chemin du dossier BL
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "bl")
    file_path = os.path.join(workspace_folder, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Le fichier {filename} n'existe pas dans ce workspace.")

    os.remove(file_path)

    return {
        "message": f"Bon de livraison {filename} supprimé avec succès du workspace {workspace_id}.",
        "workspace_id": workspace_id
    }

@router.get("/{workspace_id}/bl/")
async def list_documents(workspace_id: int):
    """Lister les BL d’un workspace"""
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "bl")
    if not os.path.exists(workspace_folder):
        return []
    
    files = [
        {"id": i, "original_filename": f}
        for i, f in enumerate(os.listdir(workspace_folder), start=1)
        if f.lower().endswith(".pdf")
    ]
    return files

@router.get("/{workspace_id}/facture-globale/")
async def get_facture_globale(workspace_id: int):
    """Retourner la facture globale d’un workspace (0 ou 1 fichier)"""
    workspace_folder = os.path.join(UPLOAD_FOLDER, f"workspace_{workspace_id}", "facture")
    if not os.path.exists(workspace_folder):
        return []
    
    files = [
        {"id": i, "original_filename": f}
        for i, f in enumerate(os.listdir(workspace_folder), start=1)
        if f.lower().endswith(".pdf")
    ]
    return files
