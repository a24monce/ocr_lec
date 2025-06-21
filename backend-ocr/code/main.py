from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image
import io
from sqlalchemy.orm import Session
from .models import Base, Client, Facture, Produit, LigneFacture
from .database import engine, SessionLocal
import shutil
import os
from fastapi import Depends

app = FastAPI()

# Autorise le frontend React à accéder à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.post("/ocr-pdf")
async def ocr_pdf(file: UploadFile = File(...)):
    contents = await file.read()

    # Conversion du PDF en images
    images = convert_from_bytes(contents)

    # OCR sur chaque image
    extracted_text = ""
    for i, image in enumerate(images):
        text = pytesseract.image_to_string(image)
        extracted_text += f"\n--- Page {i+1} ---\n{text}"

    return {"extracted_text": extracted_text}

@app.post("/upload-facture/")
async def upload_facture(file: UploadFile = File(...), is_globale: bool = Form(False)):
    # 1. Sauvegarder le fichier temporairement
    file_location = f"temp/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # 2. Faire l'OCR et parser la facture (à implémenter)
    # 3. Enregistrer les données dans la base (client, facture, produits, lignes)
    # 4. Si is_globale=True, flag la facture comme globale
    # 5. Retourner un message de succès
    return {"message": "Facture enregistrée"}

@app.post("/compare-factures/")
def compare_factures(db: Session = Depends(get_db)):
    # 1. Récupérer la facture globale
    globale = db.query(Facture).filter_by(is_globale=True).first()
    if not globale:
        return {"error": "Aucune facture globale"}
    # 2. Récupérer tous les produits de la facture globale
    produits_globaux = {l.produit.nom: l.quantite for l in globale.lignes}
    # 3. Récupérer tous les produits des autres factures
    produits_autres = {}
    autres_factures = db.query(Facture).filter_by(is_globale=False).all()
    for f in autres_factures:
        for l in f.lignes:
            produits_autres[l.produit.nom] = produits_autres.get(l.produit.nom, 0) + l.quantite
    # 4. Comparer
    manquants = []
    for nom, qte in produits_globaux.items():
        if produits_autres.get(nom, 0) < qte:
            manquants.append({"produit": nom, "attendu": qte, "trouvé": produits_autres.get(nom, 0)})
    return {"ok": len(manquants) == 0, "manquants": manquants}