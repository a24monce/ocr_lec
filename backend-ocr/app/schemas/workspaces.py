from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Schémas pour les Workspaces
class WorkspaceBase(BaseModel):
    title: str
    subtitle: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    pass

class Workspace(WorkspaceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True