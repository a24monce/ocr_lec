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
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Relations
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    factures_globales = relationship("FactureGlobale", back_populates="workspace", cascade="all, delete-orphan")

