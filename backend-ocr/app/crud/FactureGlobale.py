from sqlalchemy.orm import Session
from app.models.FactureGlobale import FactureGlobale
from app.schemas.FactureGlobale import FactureGlobaleCreate
from typing import List, Optional
import os
import shutil
from datetime import datetime


# CRUD pour les Factures Globales
def create_facture_globale(db: Session, facture: FactureGlobaleCreate) -> FactureGlobale:
    db_facture = FactureGlobale(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture

def get_facture_globale_by_workspace(db: Session, workspace_id: int) -> Optional[FactureGlobale]:
    return db.query(FactureGlobale).filter(FactureGlobale.workspace_id == workspace_id).first()

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