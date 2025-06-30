from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Numeric, Text, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func


Base = declarative_base()


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

