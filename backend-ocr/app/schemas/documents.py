from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime



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
