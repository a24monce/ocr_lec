from sqlalchemy.orm import Session
from app.models.FactureGlobale import FactureGlobale
from app.schemas.FactureGlobale import FactureGlobaleCreate
from typing import List, Optional
import os
import shutil
from datetime import datetime
from fastapi import HTTPException


# CRUD pour les Factures Globales
def create_facture_globale(db: Session, facture: FactureGlobaleCreate) -> FactureGlobale:
    db_facture = FactureGlobale(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

def get_facture_globale_by_workspace(db: Session, workspace_id: int) -> Optional[FactureGlobale]:
    facture = db.query(FactureGlobale).filter(FactureGlobale.workspace_id == workspace_id).first()
    if not facture:
        raise HTTPException(status_code=400, detail="Veuillez déposer la facture globale.")
    return facture

def require_bl_and_facture_files(bl_files: List[str], facture_file: Optional[str]):
    if not bl_files or not facture_file:
        raise HTTPException(status_code=400, detail="Veuillez déposer les bons de livraison et la facture.")

def delete_facture_globale(db: Session, facture_id: int) -> bool:
    db_facture = db.query(FactureGlobale).filter(FactureGlobale.id == facture_id).first()
    if db_facture:
        # Supprimer le fichier physique
        if os.path.exists(db_facture.file_path):
            os.remove(db_facture.file_path)
        db.delete(db_facture)
        db.commit()
        return True
    return False