from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import re
from pdf2image import convert_from_bytes
from typing import List
from sqlalchemy.orm import Session

# Import de nos modules
from .database import get_db, engine
from . import models, schemas, crud

# Créer les tables
models.Base.metadata.create_all(bind=engine)

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

        #cas spécifique Kering
        if "Kering Eyewear" in text.lower():
            for line in lines:
                match = re.search(
                    r'N\s*(?:Nom. de livraison)(?:\s*/\s*(?:N\s*)?(?:Nom. de livraison))?[^\d]{0,10}(\d{8,12})',
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

# --- Endpoints pour la gestion des workspaces ---
@app.post("/workspaces/", response_model=schemas.Workspace)
def create_workspace(workspace: schemas.WorkspaceCreate, db: Session = Depends(get_db)):
    return crud.create_workspace(db=db, workspace=workspace)

@app.get("/workspaces/", response_model=List[schemas.Workspace])
def read_workspaces(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workspaces = crud.get_workspaces(db, skip=skip, limit=limit)
    return workspaces

@app.get("/workspaces/{workspace_id}", response_model=schemas.WorkspaceWithDocuments)
def read_workspace(workspace_id: int, db: Session = Depends(get_db)):
    workspace = crud.get_workspace(db, workspace_id=workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@app.put("/workspaces/{workspace_id}", response_model=schemas.Workspace)
def update_workspace(workspace_id: int, workspace: schemas.WorkspaceCreate, db: Session = Depends(get_db)):
    db_workspace = crud.update_workspace(db, workspace_id=workspace_id, workspace=workspace)
    if db_workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return db_workspace

@app.delete("/workspaces/{workspace_id}")
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    success = crud.delete_workspace(db, workspace_id=workspace_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {"message": "Workspace deleted successfully"}

# --- Endpoints pour l'upload de fichiers ---
@app.post("/workspaces/{workspace_id}/documents/", response_model=schemas.Document)
async def upload_document(
    workspace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Vérifier que le workspace existe
    workspace = crud.get_workspace(db, workspace_id=workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Lire le contenu du fichier
    file_content = await file.read()
    
    # Sauvegarder le fichier
    file_path = crud.save_uploaded_file(file_content, file.filename, workspace_id)
    
    # Extraire le texte OCR
    ocr_text = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            images = convert_from_bytes(file_content)
            ocr_text = "\n".join([pytesseract.image_to_string(img) for img in images])
        else:
            image = Image.open(file.file)
            ocr_text = pytesseract.image_to_string(image)
    except Exception as e:
        ocr_text = f"Erreur OCR: {str(e)}"
    
    # Obtenir les informations du fichier
    file_info = crud.get_file_info(file_path)
    
    # Créer le document en base
    document_data = schemas.DocumentCreate(
        workspace_id=workspace_id,
        name=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_info["file_type"],
        file_size=file_info["file_size"],
        ocr_text=ocr_text
    )
    
    return crud.create_document(db=db, document=document_data)

@app.post("/workspaces/{workspace_id}/facture-globale/", response_model=schemas.FactureGlobale)
async def upload_facture_globale(
    workspace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Vérifier que le workspace existe
    workspace = crud.get_workspace(db, workspace_id=workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Vérifier qu'il n'y a pas déjà une facture globale
    existing_facture = crud.get_facture_globale_by_workspace(db, workspace_id=workspace_id)
    if existing_facture:
        raise HTTPException(status_code=400, detail="Une facture globale existe déjà pour ce workspace")
    
    # Lire le contenu du fichier
    file_content = await file.read()
    
    # Sauvegarder le fichier
    file_path = crud.save_uploaded_file(file_content, file.filename, workspace_id)
    
    # Extraire le texte OCR
    ocr_text = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            images = convert_from_bytes(file_content)
            ocr_text = "\n".join([pytesseract.image_to_string(img) for img in images])
        else:
            image = Image.open(file.file)
            ocr_text = pytesseract.image_to_string(image)
    except Exception as e:
        ocr_text = f"Erreur OCR: {str(e)}"
    
    # Obtenir les informations du fichier
    file_info = crud.get_file_info(file_path)
    
    # Créer la facture globale en base
    facture_data = schemas.FactureGlobaleCreate(
        workspace_id=workspace_id,
        name=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_info["file_type"],
        file_size=file_info["file_size"],
        ocr_text=ocr_text
    )
    
    return crud.create_facture_globale(db=db, facture=facture_data)

# --- Endpoint principal pour la comparaison (mis à jour) ---
@app.post("/workspaces/{workspace_id}/check-bl-in-facture")
async def check_bl_in_facture(
    workspace_id: int,
    db: Session = Depends(get_db)
):
    # Récupérer le workspace et ses documents
    workspace = crud.get_workspace(db, workspace_id=workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Récupérer la facture globale
    facture_globale = crud.get_facture_globale_by_workspace(db, workspace_id=workspace_id)
    if not facture_globale:
        raise HTTPException(status_code=400, detail="Aucune facture globale trouvée")
    
    # Récupérer tous les documents (bons de livraison)
    documents = crud.get_documents_by_workspace(db, workspace_id=workspace_id)
    if not documents:
        raise HTTPException(status_code=400, detail="Aucun bon de livraison trouvé")
    
    # Lire la facture globale
    with open(facture_globale.file_path, 'rb') as f:
        facture_bytes = f.read()
    
    # Traiter chaque document
    results = []
    for document in documents:
        # Lire le document
        with open(document.file_path, 'rb') as f:
            bl_bytes = f.read()
        
        # Extraire le numéro de BL
        bl_number = extract_bl_number_from_pdf(bl_bytes)
        
        if not bl_number:
            result = {
                "filename": document.original_filename,
                "bl_number": None,
                "found_in_facture": False,
                "error": "Numéro de BL non trouvé"
            }
        else:
            # Vérifier si le numéro est dans la facture
            bl_number_clean = bl_number.replace(" ", "")
            found = bl_number_clean in facture_globale.ocr_text.replace(" ", "")
            
            result = {
                "filename": document.original_filename,
                "bl_number": bl_number,
                "found_in_facture": found
            }
        
        # Sauvegarder le résultat en base
        bl_result_data = schemas.BLResultCreate(
            document_id=document.id,
            bl_number=bl_number,
            found_in_facture=result.get("found_in_facture", False),
            error_message=result.get("error")
        )
        crud.create_bl_result(db=db, bl_result=bl_result_data)
        
        results.append(result)
    
    return results

# --- Endpoint pour supprimer un document ---
@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: int, db: Session = Depends(get_db)):
    success = crud.delete_document(db, document_id=document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# --- Endpoint pour supprimer une facture globale ---
@app.delete("/factures-globales/{facture_id}")
def delete_facture_globale_endpoint(facture_id: int, db: Session = Depends(get_db)):
    success = crud.delete_facture_globale(db, facture_id=facture_id)
    if not success:
        raise HTTPException(status_code=404, detail="Facture globale not found")
    return {"message": "Facture globale deleted successfully"}

# --- Endpoint legacy pour compatibilité (à supprimer plus tard) ---
@app.post("/check_bl_in_facture")
async def check_bl_in_facture_legacy(
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
