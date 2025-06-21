--Workspace

DROP TABLE IF EXISTS "workspace";
CREATE TABLE "public"."workspace"(
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255),
    date DATE
);

--Documents

DROP TABLE IF EXISTS "documents";
CREATE TABLE "public"."documents"(
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255),
    date DATE,
    path VARCHAR(255)
);



--Ajouter 

DROP TABLE IF EXISTS "ajout";
CREATE TABLE "public"."ajout"(
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255),
    date DATE
);

--Ligne de facture

DROP TABLE IF EXISTS "ligne_facture";
CREATE TABLE "public"."ligne_facture"(
    id SERIAL PRIMARY KEY,
    facture_id INTEGER REFERENCES documents(id),
    reference VARCHAR(255),
    quantite INTEGER,
    prix_unitaire NUMERIC(10,2),
    tva NUMERIC(5,2),
    total_ht NUMERIC(10,2),
    total_ttc NUMERIC(10,2)
);

--recherche

DROP TABLE IF EXISTS "recherche";
CREATE TABLE "public"."recherche"(
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255),
    date DATE,
    supprimer BOOLEAN DEFAULT FALSE,
    ouvrir BOOLEAN DEFAULT FALSE,
    retour BOOLEAN DEFAULT FALSE
);





