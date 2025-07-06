import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur l'app OCR Factures</h1>
      <p className="mb-2">Choisissez une section :</p>
      <ul className="list-disc pl-6">
        <li><Link className="text-blue-600 underline" to="/factures">Gérer les factures</Link></li>
        <li><Link className="text-blue-600 underline" to="/bl">Gérer les bons de livraison</Link></li>
      </ul>
    </div>
  );
};

export default Home;