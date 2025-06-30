from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func


Base = declarative_base()


class FactureGlobale(Base):
    __tablename__ = "facture_globale"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspace.id"), nullable=False)
    name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50))
    file_size = Column(Integer)
    ocr_text = Column(Text)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    workspace = relationship("Workspace", back_populates="factures_globales")
