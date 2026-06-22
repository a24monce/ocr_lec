from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.schemas.workspaces import WorkspaceCreate, WorkspaceUpdate
from typing import List, Optional
import os
import shutil
from datetime import datetime

# CRUD pour les Workspaces
def create_workspace(db: Session, workspace: WorkspaceCreate) -> Workspace:
    db_workspace = Workspace(**workspace.dict())
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

def get_workspace(db: Session, workspace_id: int) -> Optional[Workspace]:
    return db.query(Workspace).filter(Workspace.id == workspace_id).first()

def get_workspaces(db: Session, skip: int = 0, limit: int = 100) -> List[Workspace]:
    return db.query(Workspace).offset(skip).limit(limit).all()

def update_workspace(db: Session, workspace_id: int, workspace: WorkspaceUpdate) -> Optional[Workspace]:
    db_workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if db_workspace:
        for key, value in workspace.dict(exclude_unset=True).items():
            setattr(db_workspace, key, value)
        db_workspace.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_workspace)
    return db_workspace

def delete_workspace(db: Session, workspace_id: int) -> Optional[Workspace]:
    db_workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if db_workspace:
        # Supprimer le dossier uploads du workspace s'il existe
        workspace_folder = f"workspace_{workspace_id}"
        uploads_path = os.path.join("/app/uploads", workspace_folder)
        if os.path.exists(uploads_path):
            shutil.rmtree(uploads_path)
        
        db.delete(db_workspace)
        db.commit()
        return db_workspace
    return None
