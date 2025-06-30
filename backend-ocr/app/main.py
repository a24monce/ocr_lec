from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import de nos modules
from app.db.database import engine
from app.models.workspace import Base


# Importer les routes

app = FastAPI()

from app.api.endpoints import factures, workspace
app.include_router(factures.router)
app.include_router(workspace.router)



# Créer les tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

