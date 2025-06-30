from sqlalchemy.orm import Session
from app.models.document import Document
from app.schemas.documents import DocumentCreate
from typing import List, Optional
import os
import shutil
from datetime import datetime


# CRUD pour les Documents
def create_document(db: Session, document: DocumentCreate) -> Document:
    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_documents_by_workspace(db: Session, workspace_id: int) -> List[Document]:
    return db.query(Document).filter(Document.workspace_id == workspace_id).all()

def delete_document(db: Session, document_id: int) -> bool:
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if db_document:
        # Supprimer le fichier physique
        if os.path.exists(db_document.file_path):
            os.remove(db_document.file_path)
        db.delete(db_document)
        db.commit()
        return True
    return False