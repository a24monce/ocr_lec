# Backend OCR avec Persistance

## Configuration

Cette application utilise :
- **FastAPI** pour l'API REST
- **PostgreSQL** pour la persistance des données
- **SQLAlchemy** pour l'ORM
- **Tesseract** pour l'OCR
- **Docker** pour la containerisation

## Structure de la base de données

### Tables principales :
- `workspace` : Dossiers de travail
- `document` : Bons de livraison uploadés
- `facture_globale` : Factures globales
- `bl_result` : Résultats des comparaisons BL/Facture

## Démarrage

### 1. Avec Docker (recommandé)

```bash
# Construire et démarrer les services
docker-compose up --build

# L'application sera disponible sur http://localhost:8000
# La base de données PostgreSQL sur localhost:5432
```

### 2. Développement local

```bash
# Installer les dépendances
pip install -r requirements.txt

# Démarrer PostgreSQL (assurez-vous qu'il est installé)
# Créer une base de données 'ocr'

# Initialiser la base de données
python init_db.py

# Démarrer l'application
uvicorn code.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Workspaces
- `POST /workspaces/` - Créer un workspace
- `GET /workspaces/` - Lister tous les workspaces
- `GET /workspaces/{id}` - Récupérer un workspace
- `PUT /workspaces/{id}` - Modifier un workspace
- `DELETE /workspaces/{id}` - Supprimer un workspace

### Documents
- `POST /workspaces/{id}/documents/` - Uploader un bon de livraison
- `DELETE /documents/{id}` - Supprimer un document

### Factures Globales
- `POST /workspaces/{id}/facture-globale/` - Uploader une facture globale
- `DELETE /factures-globales/{id}` - Supprimer une facture globale

### Comparaison
- `POST /workspaces/{id}/check-bl-in-facture` - Comparer les BL avec la facture

## Variables d'environnement

- `DATABASE_URL` : URL de connexion PostgreSQL (défaut: postgresql://postgres:admin@postgres:5432/ocr)

## Fichiers uploadés

Les fichiers sont stockés dans le répertoire `uploads/workspace_{id}/` avec un timestamp pour éviter les conflits de noms. 