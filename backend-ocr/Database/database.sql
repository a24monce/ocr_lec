--Ajouter

INSERT INTO "ajout" (titre, date) VALUES ('Facture globale', '2025-06-16'),
('Bon de commande 1', '2025-06-16'),
('Bon de commande 2', '2025-06-16');

--Documents

INSERT INTO "documents" (titre, date, path) VALUES ('Facture globale', '2025-06-16', 'facture_globale.pdf'),
('Bon de commande 1', '2025-06-16', 'bon_commande_1.pdf'),
('Bon de commande 2', '2025-06-16', 'bon_commande_2.pdf');

--Ligne de facture

INSERT INTO "ligne_facture" (facture_id, reference, quantite, prix_unitaire, tva, total_ht, total_ttc) VALUES (1, '1234567890', 1, 100, 20, 100, 120),
(2, '1234567890', 1, 100, 20, 100, 120),
(3, '1234567890', 1, 100, 20, 100, 120);

--Recherche

INSERT INTO "recherche" (titre, date, supprimer, ouvrir, retour) VALUES ('Facture globale', '2025-06-16', FALSE, FALSE, FALSE),
('Bon de commande 1', '2025-06-16', FALSE, FALSE, FALSE),
('Bon de commande 2', '2025-06-16', FALSE, FALSE, FALSE);

--Workspace

INSERT INTO "workspace" (titre, date) VALUES ('Facture Luxottica', '2025-06-16'),
('Facture Thélios', '2025-06-16'),
('Facture Gucci', '2025-06-16');

