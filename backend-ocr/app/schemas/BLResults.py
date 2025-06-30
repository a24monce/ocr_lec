from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


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
