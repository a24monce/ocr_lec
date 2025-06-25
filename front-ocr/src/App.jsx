import React, { useRef, useState } from "react";
import logo from "./assets/logo-osplus.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Pagination({ current, total, onPageChange }) {
  const pages = [];
  const maxPagesToShow = 5;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (current <= 3) {
    end = Math.min(total, maxPagesToShow);
  } else if (current >= total - 2) {
    start = Math.max(1, total - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2 justify-center py-4">
      <button
        className="text-gray-500 hover:text-black px-2"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        &larr; Précédent
      </button>
      {start > 1 && (
        <>
          <button
            className={`px-3 py-1 rounded ${current === 1 ? "bg-gray-800 text-white" : ""}`}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded ${current === page ? "bg-gray-800 text-white" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {end < total && (
        <>
          {end < total - 1 && <span className="px-2">...</span>}
          <button
            className={`px-3 py-1 rounded ${current === total ? "bg-gray-800 text-white" : ""}`}
            onClick={() => onPageChange(total)}
          >
            {total}
          </button>
        </>
      )}
      <button
        className="text-gray-500 hover:text-black px-2"
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
      >
        Suivant &rarr;
      </button>
    </div>
  );
}

export default function App() {
  // Démarre avec aucun workspace par défaut
  
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editTitle, setEditTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [subtitleInput, setSubtitleInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef();
  const fileInputGlobalRef = useRef();
  const [globalFacture, setGlobalFacture] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [showOcr, setShowOcr] = useState(false);
  const [editingDocIdx, setEditingDocIdx] = useState(null);
  const [editingDocName, setEditingDocName] = useState("");
  const [showOcrPage, setShowOcrPage] = useState(false);
  const [bonsFiles, setBonsFiles] = useState([]);
  const [globalFile, setGlobalFile] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [showComparePage, setShowComparePage] = useState(false);
  const [blFiles, setBlFiles] = useState([]);
  const [factureFile, setFactureFile] = useState(null);
  const [resultats, setResultats] = useState(null);
  const [showResultPage, setShowResultPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const blInputRef = useRef();
  const factureInputRef = useRef();
  const bonInputRef = useRef();
  const globalInputRef = useRef();

  // Si aucun workspace, activeWs est undefined
  const activeWs = workspaces.find((w) => w.id === activeId);
  const docsPerPage = 5;
  const totalDocs = activeWs ? activeWs.documents.length : 0;
  const totalPages = Math.ceil(totalDocs / docsPerPage);
  const paginatedDocs = activeWs ? activeWs.documents.slice(
    (currentPage - 1) * docsPerPage,
    currentPage * docsPerPage
  ) : [];

  // Récupère tous les documents de tous les workspaces
  const allDocuments = workspaces.flatMap(ws =>
    ws.documents.map(doc => ({ ...doc, wsTitle: ws.title, wsId: ws.id }))
  );

  // Créer un nouveau workspace vide
  const handleNewWorkspace = () => {
    const newId = Date.now();
    const newWs = {
      id: newId,
      title: "Nouveau titre",
      subtitle: "Date",
      documents: [],
      globalFacture: null,
    };
    setWorkspaces([newWs, ...workspaces]);
    setActiveId(newId);
    setEditTitle(true);
    setTitleInput("");
    setSubtitleInput("");
    setShowSearch(false);
    setCurrentPage(1);
    setBlFiles([]);         // <-- Ajoute ceci
    setFactureFile(null);   // <-- Et ceci
  };

  // Changer de workspace
  const handleSelectWorkspace = (id) => {
    setActiveId(id);
    setEditTitle(false);
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Supprimer un workspace
  const handleDeleteWorkspace = (id) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce dossier ?");
    if (!confirmDelete) return;
    
    const idx = workspaces.findIndex((ws) => ws.id === id);
    const newWorkspaces = workspaces.filter((ws) => ws.id !== id);
    setWorkspaces(newWorkspaces);
    if (id === activeId) {
      if (newWorkspaces.length >= 0) {
        const next = newWorkspaces[Math.min(idx, newWorkspaces.length - 1)];
        setActiveId(next.id);
      }
    }
    setShowSearch(false);
  };

  // Upload d'un document dans le workspace actif
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        // Ajoute le fichier à l'état local pour l'afficher dans la liste
        setWorkspaces((prev) =>
          prev.map((ws) =>
            ws.id === activeId
              ? { ...ws, documents: [{ name: data.filename, date: new Date().toLocaleString(), ocr: data.ocr }, ...ws.documents] }
              : ws
          )
        );
        alert('Fichier envoyé avec succès !');
      } else {
        alert('Erreur : ' + data.error);
      }
    } catch (e) {
      alert('Erreur de connexion au serveur.');
    }
  };
  

  // Edition du titre/sous-titre
  const handleEditTitle = () => {
    setEditTitle(true);
    setTitleInput(activeWs.title);
    setSubtitleInput(activeWs.subtitle);
  };
  const handleSaveTitle = () => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeId
          ? { ...ws, title: titleInput, subtitle: subtitleInput }
          : ws
      )
    );
    setEditTitle(false);
  };

  // Recherche filtrée pour dossiers
  const filteredWorkspaces = workspaces.filter(ws =>
    ws.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recherche filtrée pour documents (si tu veux garder la recherche de documents)
  const filteredDocs = allDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.wsTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Supprimer un document du workspace actif
  const handleDeleteDoc = (docIdx) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce fichier ?");
    if (!confirmDelete) return;
    
    if (docIdx === "global") {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === activeId ? { ...ws, globalFacture: null } : ws
        )
      );
      return;
    }
    
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeId
          ? { ...ws, documents: ws.documents.filter((_, idx) => idx !== docIdx) }
          : ws
      )
    );
  };

  const handleUploadGlobalFacture = () => {
    fileInputGlobalRef.current.click();
  };

  const handleUploadGlobalFactureFile = (event) => {
    const file = event.target.files[0];
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce dossier ?");
    if (!file) return;
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeId
          ? { ...ws, globalFacture: { name: file.name, date: new Date().toLocaleString() } }
          : ws
      )
    );
    event.target.value = "";
  };

  const handleUploadBon = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setBonsFiles(prev => [...prev, file]);
  };

  const handleTraiter = async () => {
    if (!blFiles.length || !factureFile) {
      alert("Dépose au moins un bon de livraison et une facture globale !");
      return;
    }
    setLoading(true);
    setProgress(0);

    // Simule la progression (pour l'effet visuel)
    let fakeProgress = 0;
    const interval = setInterval(() => {
      fakeProgress += Math.floor(Math.random() * 10) + 5;
      setProgress(Math.min(fakeProgress, 95));
    }, 200);

    const formData = new FormData();
    blFiles.forEach(file => formData.append("bl_files", file));
    formData.append("facture_file", factureFile);

    const res = await fetch("http://localhost:8000/check_bl_in_facture", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    clearInterval(interval);
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setResultats(data);
      setShowResultPage(true);
      setProgress(0);
    }, 500); // petit délai pour voir la barre à 100%
  };

  const handleEditDocName = (idx) => {
    setEditingDocIdx(idx);
    setEditingDocName(paginatedDocs[idx].name);
  };

  const handleSaveDocName = (docIdx) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeId
          ? {
              ...ws,
              documents: ws.documents.map((doc, idx) =>
                idx === (currentPage - 1) * docsPerPage + docIdx
                  ? { ...doc, name: editingDocName }
                  : doc
              ),
            }
          : ws
      )
    );
    setEditingDocIdx(null);
    setEditingDocName("");
  };

  const handleUploadGlobal = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setGlobalFile(file);
  };

  const handleBlUploadClick = () => blInputRef.current.click();
  const handleFactureUploadClick = () => factureInputRef.current.click();

  const handleBlFilesChange = (e) => {
    setBlFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  const handleFactureFileChange = (e) => {
    setFactureFile(e.target.files[0]);
    e.target.value = "";
  };

  if (showResultPage) {
    return (
      <div className="bg-[#a18aff] min-h-screen w-full flex">
        {/* Sidebar */}
        <aside className="h-screen w-24 bg-[#e5e0f7] flex flex-col items-center py-6 z-20">
          <img src={logo} alt="Logo OS+" className="w-16 mb-6" />
          {/* ... autres éléments de la sidebar ... */}
        </aside>
        {/* Contenu centré */}
        <div className="flex-1 min-h-screen flex flex-col items-center justify-center">
          <button
            className="mb-6 px-6 py-2 bg-[#b6aaff] text-white rounded-full font-bold"
            onClick={() => setShowResultPage(false)}
          >
            Retour
          </button>
          <div className="bg-white text-black p-6 rounded-lg shadow max-w-2xl w-full flex flex-col items-center justify-center">
            <img src={logo} alt="Logo OS+" className="w-24 mb-4" />
            <h2 className="text-xl font-bold mb-4">Résultat de la comparaison</h2>
            {resultats && resultats.map((res, idx) => (
              <div key={idx} className="mb-4 text-center">
                <div className="font-bold">{res.filename}</div>
                <div>Numéro BL détecté : <span className="font-mono">{res.bl_number || "Non trouvé"}</span></div>
                <div>
                  {res.found_in_facture
                    ? <span className="text-green-600 font-bold">Présent dans la facture</span>
                    : <span className="text-red-600 font-bold">Absent de la facture</span>
                  }
                </div>
                {res.error && <div className="text-red-600">{res.error}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#a18aff] min-h-screen w-full flex">
      {/* Sidebar violet clair, navigation uniquement */}
      <aside className="fixed left-0 top-0 h-screen w-24 bg-[#e5e0f7] flex flex-col items-center py-6 z-20">
        <img src={logo} alt="Logo OS+" className="w-16 mb-6" />
        {/* Icône recherche */}
        <button
          className={`bg-[#b6aaff] hover:bg-[#a18aff] text-white rounded-full w-11 h-11 flex items-center justify-center text-2xl mb-2 transition ${showSearch ? 'ring-4 ring-[#a18aff]' : ''}`}
          title="Rechercher un dossier"
          onClick={() => setShowSearch(true)}
        >
          🔍
        </button>
        <span className="text-xs text-[#a18aff] mb-4">Recherche</span>
        {/* Nouveau dossier */}
        <button
          className="bg-[#b6aaff] hover:bg-[#a18aff] text-white rounded-full w-11 h-11 flex items-center justify-center text-2xl mb-2 transition"
          title="Nouveau dossier"
          onClick={handleNewWorkspace}
        >
          ✏️
        </button>
        <span className="text-xs text-[#a18aff]">Nouveau</span>
      </aside>

      {/* Décalage pour le main-content à cause de la sidebar fixe */}
      <div className="flex-1 ml-24 min-h-screen">
        <main className="min-h-screen p-10 flex flex-col bg-[#a18aff]">
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl text-white mb-4">Aucun dossier n'a encore été créé.</h2>
              <p className="text-white/80 mb-8">Clique sur <span className='font-bold'>Nouveau</span> dans la barre latérale pour créer ton premier dossier.</p>
            </div>
          ) : showSearch ? (
            <div className="flex flex-col items-center w-full">
              <h2 className="text-3xl font-bold text-white mb-6">Recherche de dossiers</h2>
              <input
                className="w-full max-w-xl rounded-lg border border-[#b6aaff] px-4 py-2 mb-8 text-lg"
                placeholder="Rechercher un dossier..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="w-full max-w-4xl bg-[#b6aaff] rounded-xl p-8 mb-8 overflow-x-auto">
                <h3 className="text-xl font-semibold mb-4 text-white">Tous les dossiers</h3>
                <table className="min-w-full divide-y divide-[#e5e0f7]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#b6aaff] divide-y divide-[#e5e0f7]">
                    {filteredWorkspaces.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-white/80">Aucun dossier trouvé.</td>
                      </tr>
                    )}
                    {filteredWorkspaces.map((ws) => (
                      <tr key={ws.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-bold">{ws.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{ws.subtitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out"
                            onClick={() => handleSelectWorkspace(ws.id)}
                          >
                            Ouvrir
                          </button>
                          <button
                            className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out"
                            onClick={() => handleDeleteWorkspace(ws.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="bg-white text-[#a18aff] rounded-full px-8 py-2 text-lg font-bold hover:bg-[#b6aaff] hover:text-white transition"
                onClick={() => setShowSearch(false)}
              >
                Retour
              </button>
            </div>
          ) : 
            <>
              <div className="flex items-center gap-6 mb-8">
                {editTitle ? (
                  <>
                    <input
                      className="text-2xl font-bold rounded-lg border border-[#b6aaff] px-3 py-1 mr-2"
                      value={titleInput}
                      onChange={e => setTitleInput(e.target.value)}
                      placeholder="Titre"
                      autoFocus
                    />
                    <div className="flex flex-col items-start mr-2">
                      <DatePicker
                        selected={subtitleInput ? new Date(subtitleInput) : null}
                        onChange={date => setSubtitleInput(date ? date.toISOString().slice(0, 10) : "")}
                        dateFormat="yyyy-MM-dd"
                        className="border-2 border-gray-300 rounded px-3 py-2 w-56"
                        placeholderText="Sélectionner une date"
                      />
                    </div>
                    <button
                      className="bg-[#b6aaff] hover:bg-[#a18aff] text-white rounded-lg px-4 py-2 text-lg transition"
                      onClick={handleSaveTitle}
                    >
                      💾
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-white">{activeWs.title}</h2>
                    <p className="text-lg text-[#e5e0f7]">{activeWs.subtitle}</p>
                    <button
                      className="bg-[#b6aaff] hover:bg-[#a18aff] text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition"
                      title="Modifier le titre"
                      onClick={handleEditTitle}
                    >
                      🖉
                    </button>
                  </>
                )}
                <div className="flex gap-4 mb-6">
                  <button
                    className="bg-[#ffb6b6] hover:bg-[#ff8a8a] text-white rounded-full px-6 py-2 text-lg font-semibold transition"
                    onClick={handleBlUploadClick}
                  >
                    Déposer
                  </button>
                  <input
                    type="file"
                    ref={blInputRef}
                    style={{ display: "none" }}
                    multiple
                    onChange={handleBlFilesChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />

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
                    onChange={handleFactureFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">Documents déposés</h3>
                  {blFiles.length === 0 ? (
                    <p className="text-white/80">Aucun document pour l'instant.</p>
                  ) : (
                    <ul>
                      {blFiles.map((file, idx) => (
                        <li key={idx} className="text-white flex items-center justify-between">
                          <span>{file.name}</span>
                          <button
                            className="ml-2 text-red-500 hover:text-red-700"
                            title="Supprimer"
                            onClick={() => {
                              const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce dossier ?");
                              if (confirmDelete) {
                                setBlFiles(prev => prev.filter((_, i) => i !== idx));
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">Facture globale déposée</h3>
                  {factureFile ? (
                    <div className="text-white flex items-center justify-between">
                      <span>{factureFile.name}</span>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Supprimer"
                        onClick={() => setFactureFile(null)}
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/80">Vous n'avez pas encore déposé la facture globale.</p>
                  )}
                </div>
              </div>


              {/* Traiter button */}
              <div className="flex justify-center">
                <button
                  className="bg-white text-[#a18aff] rounded-full px-12 py-3 text-lg font-bold hover:bg-[#b6aaff] hover:text-white transition"
                  onClick={handleTraiter}
                >
                  Traiter
                </button>
              </div>
              {loading && (
                <div className="w-full flex justify-center mt-4">
                  <div className="w-1/2 bg-white rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-[#b6aaff] h-4 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 text-white font-bold">{progress}%</span>
                </div>
              )}
            </>
          }
          <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} />
          {showOcr && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#a18aff]">
              <button
                className="mb-6 px-6 py-2 bg-[#b6aaff] text-white rounded-full font-bold"
                onClick={() => setShowOcr(false)}
              >
                Retour
              </button>
              <div className="bg-white text-black p-6 rounded-lg shadow max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Transcription OCR</h2>
                <pre className="whitespace-pre-wrap">{ocrText}</pre>
              </div>
            </div>
          )}
          {showComparePage ? (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#a18aff]">
              <button
                className="mb-6 px-6 py-2 bg-[#b6aaff] text-white rounded-full font-bold"
                onClick={() => setShowComparePage(false)}
              >
                Retour
              </button>
              <div className="bg-white text-black p-6 rounded-lg shadow max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Résultat de la comparaison</h2>
                {compareResult && (
                  <>
                    {compareResult.ok ? (
                      <div className="text-green-600 font-bold">Tout est OK !</div>
                    ) : (
                      <>
                        {compareResult.manquants.length > 0 && (
                          <div>
                            <span className="font-bold text-red-600">Manquants :</span>
                            <ul>
                              {compareResult.manquants.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {compareResult.en_trop.length > 0 && (
                          <div>
                            <span className="font-bold text-orange-600">En trop :</span>
                            <ul>
                              {compareResult.en_trop.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
