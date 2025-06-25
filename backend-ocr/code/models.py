from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Numeric, Text
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()

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


class Document(Base):
    __tablename__ = "document"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    ocr = Column(Text)

