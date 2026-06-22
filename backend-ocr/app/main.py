from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import de nos modules
from app.db.database import engine
from app.models.workspace import Base

# Importer tous les modèles pour que SQLAlchemy puisse résoudre les relations
from app.models import workspace, document, FactureGlobale

# Importer les routes
from app.api.endpoints import factures, workspace

app = FastAPI()

# Inclure les routers (sans préfixe car déjà défini dans les fichiers)
app.include_router(factures.router, tags=["factures"])
app.include_router(workspace.router, tags=["workspace"])

# Créer les tables
Base.metadata.create_all(bind=engine)

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Définir le chemin du dossier uploads
UPLOAD_FOLDER = "/app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Monter /uploads comme dossier statique
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

