import React, { useState } from "react";
import Button from "./Button";
import { check_facture_in_bl } from "../lib/facture";

export default function Traiter({ workspaceId, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleTraiter = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulation progression
    let fakeProgress = 0;
    const interval = setInterval(() => {
      fakeProgress += Math.floor(Math.random() * 2) + 1;
      fakeProgress = Math.min(fakeProgress, 99);
      setProgress(fakeProgress);
       
    }, 300);

    try {
      const data = await check_facture_in_bl(workspaceId);
      clearInterval(interval);
      setProgress(100);
      onResult(data);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 rounded-lg ">
      <Button onClick={handleTraiter}>Traiter</Button>

      {/* Progress bar avec pourcentage */}
      {loading && (
        <div className="w-full mt-4">
          <div className="text-center font-medium text-sm mb-1">
            {progress}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#b6aaff] h-4 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
