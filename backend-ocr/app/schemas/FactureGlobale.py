from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


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