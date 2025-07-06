import React from "react";
import { useSelector } from "react-redux";

export default function FactureList() {
  const factures = useSelector((state) => state.facture.list);

  return (
    <div>
      <h2>Factures</h2>
      <ul>
        {factures.map((facture, index) => (
          <li key={index}>{facture.name}</li>
        ))}
      </ul>
    </div>
  );
}
