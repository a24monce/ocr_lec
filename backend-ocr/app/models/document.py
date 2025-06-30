from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func


Base = declarative_base()



class Document(Base):
    __tablename__ = "document"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspace.id"), nullable=False)
    name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Chemin vers le fichier sur le serveur
    file_type = Column(String(50))  # pdf, png, jpg, etc.
    file_size = Column(Integer)  # Taille en bytes
    ocr_text = Column(Text)  # Texte extrait par OCR
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    workspace = relationship("Workspace", back_populates="documents")
    bl_results = relationship("BLResult", back_populates="document", cascade="all, delete-orphan")