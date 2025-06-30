from pydantic import BaseModel
from typing import List, Optional
from app.models.workspace import Workspace
from app.models.document import Document
from app.models.FactureGlobale import FactureGlobale

# Schémas pour les réponses API
class WorkspaceWithDocuments(Workspace):
    documents: List[Document] = []
    factures_globales: List[FactureGlobale] = []

class BLComparisonResult(BaseModel):
    filename: str
    bl_number: Optional[str]
    found_in_facture: bool
    error: Optional[str] = None 