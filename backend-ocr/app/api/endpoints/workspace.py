from fastapi import APIRouter, UploadFile, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.crud.workspace import (
    create_workspace as create_workspace_crud,
    get_workspace as get_workspace_crud,
    get_workspaces as get_workspaces_crud,
    delete_workspace as delete_workspace_crud,
    update_workspace as update_workspace_crud,
)
from app.schemas.workspaces import WorkspaceCreate, Workspace as WorkspaceSchema, WorkspaceUpdate

import os

router = APIRouter(tags=["workspace"])

UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/", response_model=WorkspaceSchema)
def create_workspace(workspace: WorkspaceCreate, db: Session = Depends(get_db)):
    return create_workspace_crud(db, workspace)


@router.get("/", response_model=List[WorkspaceSchema])
def list_workspaces(db: Session = Depends(get_db)):
    return get_workspaces_crud(db)


@router.get("/{workspace_id}", response_model=WorkspaceSchema)
def read_workspace(workspace_id: int, db: Session = Depends(get_db)):
    ws = get_workspace_crud(db, workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace introuvable")
    return ws


@router.put("/{workspace_id}", response_model=WorkspaceSchema)
def update_workspace(workspace_id: int, workspace: WorkspaceUpdate, db: Session = Depends(get_db)):
    return update_workspace_crud(db, workspace_id, workspace)


@router.delete("/{workspace_id}", response_model=WorkspaceSchema)
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    deleted_workspace = delete_workspace_crud(db, workspace_id)
    if not deleted_workspace:
        raise HTTPException(status_code=404, detail="Workspace introuvable")
    return deleted_workspace


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
