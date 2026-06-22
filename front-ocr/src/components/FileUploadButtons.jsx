import React, { useRef } from "react";


export default function UploadButtons({ onBlUpload, onFactureUpload }) {
  const blInputRef = useRef();
  const factureInputRef = useRef();

  const handleBlUploadClick = () => blInputRef.current.click();
  const handleFactureUploadClick = () => factureInputRef.current.click();

  return (
    <div className="flex gap-4 mb-6">
      {/* Bouton pour BL */}
      <button
        className="bg-[#ffb6b6] hover:bg-[#ff8a8a] text-white rounded-full px-6 py-2 text-lg font-semibold transition"
        onClick={handleBlUploadClick}
      >
        Déposer BL
      </button>
      <input
        type="file"
        ref={blInputRef}
        style={{ display: "none" }}
        multiple
        onChange={onBlUpload}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      {/* Bouton pour facture */}
      <button
        className="bg-[#ffb6b6] hover:bg-[#ff8a8a] text-white rounded-full px-6 py-2 text-lg font-semibold transition"
        onClick={handleFactureUploadClick}
      >
        Déposer facture globale
      </button>
      <input
        type="file"
        ref={factureInputRef}
        style={{ display: "none" }}
        onChange={onFactureUpload}
        accept=".pdf,.png,.jpg,.jpeg"
      />
    </div>
  );
}
