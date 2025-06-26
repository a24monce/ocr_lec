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

# Schémas pour les Documents
class DocumentBase(BaseModel):
    name: str
    original_filename: str
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    ocr_text: Optional[str] = None

class DocumentCreate(DocumentBase):
    workspace_id: int

class Document(DocumentBase):
    id: int
    workspace_id: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les Factures Globales
class FactureGlobaleBase(BaseModel):
    name: str
    original_filename: str
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    ocr_text: Optional[str] = None

class FactureGlobaleCreate(FactureGlobaleBase):
    workspace_id: int

class FactureGlobale(FactureGlobaleBase):
    id: int
    workspace_id: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les Résultats BL
class BLResultBase(BaseModel):
    bl_number: Optional[str] = None
    found_in_facture: bool = False
    error_message: Optional[str] = None

class BLResultCreate(BLResultBase):
    document_id: int

class BLResult(BLResultBase):
    id: int
    document_id: int
    processed_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les réponses API
class WorkspaceWithDocuments(Workspace):
    documents: List[Document] = []
    factures_globales: List[FactureGlobale] = []

class BLComparisonResult(BaseModel):
    filename: str
    bl_number: Optional[str]
    found_in_facture: bool
    error: Optional[str] = None 