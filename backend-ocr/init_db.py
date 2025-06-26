#!/usr/bin/env python3
"""
Script d'initialisation de la base de données
"""
import sys
import os

# Ajouter le répertoire code au path
sys.path.append(os.path.join(os.path.dirname(__file__), 'code'))

from code.database import engine
from code.models import Base

def init_database():
    """Créer toutes les tables de la base de données"""
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès!")

if __name__ == "__main__":
    init_database() 