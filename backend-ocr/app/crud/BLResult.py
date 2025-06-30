from sqlalchemy.orm import Session
from app.models.BLResult import BLResult
from app.schemas.BLResults import BLResultCreate
from typing import List, Optional
import os
import shutil
from datetime import datetime

# CRUD pour les Résultats BL
def create_bl_result(db: Session, bl_result: BLResultCreate) -> BLResult:
    db_bl_result = BLResult(**bl_result.dict())
    db.add(db_bl_result)
    db.commit()
    db.refresh(db_bl_result)
    return db_bl_result

def get_bl_results_by_document(db: Session, document_id: int) -> List[BLResult]:
    return db.query(BLResult).filter(BLResult.document_id == document_id).all()

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