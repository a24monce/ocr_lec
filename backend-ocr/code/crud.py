from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional
import os
import shutil
from datetime import datetime

# CRUD pour les Workspaces
def create_workspace(db: Session, workspace: schemas.WorkspaceCreate) -> models.Workspace:
    db_workspace = models.Workspace(**workspace.dict())
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

def get_workspace(db: Session, workspace_id: int) -> Optional[models.Workspace]:
    return db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()

def get_workspaces(db: Session, skip: int = 0, limit: int = 100) -> List[models.Workspace]:
    return db.query(models.Workspace).offset(skip).limit(limit).all()

def update_workspace(db: Session, workspace_id: int, workspace: schemas.WorkspaceCreate) -> Optional[models.Workspace]:
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if db_workspace:
        for key, value in workspace.dict().items():
            setattr(db_workspace, key, value)
        db.commit()
        db.refresh(db_workspace)
    return db_workspace

def delete_workspace(db: Session, workspace_id: int) -> bool:
    db_workspace = db.query(models.Workspace).filter(models.Workspace.id == workspace_id).first()
    if db_workspace:
        db.delete(db_workspace)
        db.commit()
        return True
    return False

# CRUD pour les Documents
def create_document(db: Session, document: schemas.DocumentCreate) -> models.Document:
    db_document = models.Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_documents_by_workspace(db: Session, workspace_id: int) -> List[models.Document]:
    return db.query(models.Document).filter(models.Document.workspace_id == workspace_id).all()

def delete_document(db: Session, document_id: int) -> bool:
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document:
        # Supprimer le fichier physique
        if os.path.exists(db_document.file_path):
            os.remove(db_document.file_path)
        db.delete(db_document)
        db.commit()
        return True
    return False

# CRUD pour les Factures Globales
def create_facture_globale(db: Session, facture: schemas.FactureGlobaleCreate) -> models.FactureGlobale:
    db_facture = models.FactureGlobale(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

def get_facture_globale_by_workspace(db: Session, workspace_id: int) -> Optional[models.FactureGlobale]:
    return db.query(models.FactureGlobale).filter(models.FactureGlobale.workspace_id == workspace_id).first()

def delete_facture_globale(db: Session, facture_id: int) -> bool:
    db_facture = db.query(models.FactureGlobale).filter(models.FactureGlobale.id == facture_id).first()
    if db_facture:
        # Supprimer le fichier physique
        if os.path.exists(db_facture.file_path):
            os.remove(db_facture.file_path)
        db.delete(db_facture)
        db.commit()
        return True
    return False

# CRUD pour les Résultats BL
def create_bl_result(db: Session, bl_result: schemas.BLResultCreate) -> models.BLResult:
    db_bl_result = models.BLResult(**bl_result.dict())
    db.add(db_bl_result)
    db.commit()
    db.refresh(db_bl_result)
    return db_bl_result

def get_bl_results_by_document(db: Session, document_id: int) -> List[models.BLResult]:
    return db.query(models.BLResult).filter(models.BLResult.document_id == document_id).all()

# Fonctions utilitaires pour la gestion des fichiers
def save_uploaded_file(file_content: bytes, filename: str, workspace_id: int) -> str:
    """Sauvegarde un fichier uploadé et retourne le chemin"""
    upload_dir = f"uploads/workspace_{workspace_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Générer un nom de fichier unique
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    return file_path

def get_file_info(file_path: str) -> dict:
    """Retourne les informations d'un fichier"""
    if os.path.exists(file_path):
        stat = os.stat(file_path)
        return {
            "file_size": stat.st_size,
            "file_type": os.path.splitext(file_path)[1].lower()
        }
    return {"file_size": 0, "file_type": ""} 