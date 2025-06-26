from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func


Base = declarative_base()

class Workspace(Base):
    __tablename__ = "workspace"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255))  # Pour stocker la date
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    factures_globales = relationship("FactureGlobale", back_populates="workspace", cascade="all, delete-orphan")

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

class BLResult(Base):
    __tablename__ = "bl_result"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("document.id"), nullable=False)
    bl_number = Column(String(100))  # Numéro de BL extrait
    found_in_facture = Column(Boolean, default=False)
    error_message = Column(Text)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    document = relationship("Document", back_populates="bl_results")

class Client(Base):
    __tablename__ = "client"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    adresse = Column(Text)
    factures = relationship("Facture", back_populates="client")

class Facture(Base):
    __tablename__ = "facture"
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("client.id"))
    date = Column(Date)
    numero = Column(String)
    reference = Column(String)
    echeance = Column(Date)
    paiement = Column(String)
    is_globale = Column(Boolean, default=False)
    client = relationship("Client", back_populates="factures")
    lignes = relationship("LigneFacture", back_populates="facture")

class Produit(Base):
    __tablename__ = "produit"
    id = Column(Integer, primary_key=True)
    nom = Column(String)
    description = Column(Text)
    lignes = relationship("LigneFacture", back_populates="produit")

class LigneFacture(Base):
    __tablename__ = "ligne_facture"
    id = Column(Integer, primary_key=True)
    facture_id = Column(Integer, ForeignKey("facture.id"))
    produit_id = Column(Integer, ForeignKey("produit.id"))
    quantite = Column(Integer)
    unite = Column(String)
    prix_unitaire = Column(Numeric)
    tva = Column(Numeric)
    total_ht = Column(Numeric)
    total_tva = Column(Numeric)
    total_ttc = Column(Numeric)
    facture = relationship("Facture", back_populates="lignes")
    produit = relationship("Produit", back_populates="lignes")

