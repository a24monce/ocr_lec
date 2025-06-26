import React, { useRef, useState, useEffect } from "react";
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
  // États pour la persistance
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [editTitle, setEditTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [subtitleInput, setSubtitleInput] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultats, setResultats] = useState(null);
  const [showResultPage, setShowResultPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const blInputRef = useRef();
  const factureInputRef = useRef();

  // Charger les workspaces au démarrage
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Charger les workspaces depuis l'API
  const loadWorkspaces = async () => {
    try {
      const response = await fetch('http://localhost:8000/workspaces/');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !activeId) {
          setActiveId(data[0].id);
          setCurrentWorkspace(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des workspaces:', error);
    }
  };

  // Charger un workspace spécifique avec ses documents
  const loadWorkspace = async (workspaceId) => {
    try {
      const response = await fetch(`http://localhost:8000/workspaces/${workspaceId}`);
      if (response.ok) {
        const workspace = await response.json();
        setCurrentWorkspace(workspace);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du workspace:', error);
    }
  };

  // Si aucun workspace, activeWs est undefined
  const activeWs = currentWorkspace;
  const docsPerPage = 5;
  const totalDocs = activeWs && Array.isArray(activeWs.documents) ? activeWs.documents.length : 0;
  const totalPages = Math.ceil(totalDocs / docsPerPage);
  const paginatedDocs = activeWs && Array.isArray(activeWs.documents)
    ? activeWs.documents.slice((currentPage - 1) * docsPerPage, currentPage * docsPerPage)
    : [];

  // Récupère tous les documents de tous les workspaces
  const allDocuments = workspaces.flatMap(ws =>
    ws.documents ? ws.documents.map(doc => ({ ...doc, wsTitle: ws.title, wsId: ws.id })) : []
  );

  // Créer un nouveau workspace vide
  const handleNewWorkspace = async () => {
    try {
      const response = await fetch('http://localhost:8000/workspaces/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "Nouveau titre",
          subtitle: new Date().toISOString().slice(0, 10)
        })
      });
      
      if (response.ok) {
        const newWorkspace = await response.json();
        setWorkspaces(prev => [newWorkspace, ...prev]);
        setActiveId(newWorkspace.id);
        setCurrentWorkspace(newWorkspace);
        setEditTitle(true);
        setTitleInput("");
        setSubtitleInput("");
        setShowSearch(false);
        setCurrentPage(1);
      } else {
        console.error('Erreur lors de la création du workspace');
        alert('Erreur lors de la création du workspace');
      }
    } catch (error) {
      console.error('Erreur lors de la création du workspace:', error);
      alert('Erreur lors de la création du workspace: ' + error.message);
    }
  };

  // Changer de workspace
  const handleSelectWorkspace = async (id) => {
    setActiveId(id);
    setEditTitle(false);
    setShowSearch(false);
    setCurrentPage(1);
    await loadWorkspace(id);
  };

  // Supprimer un workspace
  const handleDeleteWorkspace = async (id) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce dossier ?");
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8000/workspaces/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const newWorkspaces = workspaces.filter((ws) => ws.id !== id);
        setWorkspaces(newWorkspaces);
        if (id === activeId) {
          if (newWorkspaces.length > 0) {
            const next = newWorkspaces[0];
            setActiveId(next.id);
            setCurrentWorkspace(next);
          } else {
            setActiveId(null);
            setCurrentWorkspace(null);
            setShowSearch(true);
          }
        }
        setShowSearch(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du workspace:', error);
    }
  };

  // Edition du titre/sous-titre
  const handleEditTitle = () => {
    setEditTitle(true);
    setTitleInput(activeWs.title);
    setSubtitleInput(activeWs.subtitle);
  };

  const handleSaveTitle = async () => {
    try {
      const response = await fetch(`http://localhost:8000/workspaces/${activeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleInput,
          subtitle: subtitleInput
        })
      });
      
      if (response.ok) {
        const updatedWorkspace = await response.json();
        setWorkspaces(prev => prev.map(ws => ws.id === activeId ? updatedWorkspace : ws));
        setCurrentWorkspace(updatedWorkspace);
        setEditTitle(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du workspace:', error);
    }
  };

  // Recherche filtrée pour dossiers
  const filteredWorkspaces = workspaces.filter(ws =>
    ws.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recherche filtrée pour documents
  const filteredDocs = allDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.wsTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Supprimer un document du workspace actif
  const handleDeleteDoc = async (docId) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce fichier ?");
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8000/documents/${docId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Recharger le workspace pour avoir les données à jour
        await loadWorkspace(activeId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
    }
  };

  const handleBlUploadClick = () => blInputRef.current.click();
  const handleFactureUploadClick = () => factureInputRef.current.click();

  const handleBlFilesChange = async (e) => {
    if (!activeId) {
      alert("Veuillez d'abord créer ou sélectionner un workspace");
      return;
    }

    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`http://localhost:8000/workspaces/${activeId}/documents/`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          // Recharger le workspace pour avoir les données à jour
          await loadWorkspace(activeId);
        } else {
          alert(`Erreur lors de l'upload de ${file.name}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        alert(`Erreur lors de l'upload de ${file.name}`);
      }
    }
    e.target.value = "";
  };

  const handleFactureFileChange = async (e) => {
    if (!activeId) {
      alert("Veuillez d'abord créer ou sélectionner un workspace");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`http://localhost:8000/workspaces/${activeId}/facture-globale/`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Recharger le workspace pour avoir les données à jour
        await loadWorkspace(activeId);
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert(`Erreur lors de l'upload de ${file.name}`);
    }
    e.target.value = "";
  };

  const handleTraiter = async () => {
    if (!activeId) {
      alert("Veuillez d'abord créer ou sélectionner un workspace");
      return;
    }

    if (!currentWorkspace || !currentWorkspace.documents || currentWorkspace.documents.length === 0) {
      alert("Dépose au moins un bon de livraison !");
      return;
    }

    if (!currentWorkspace.factures_globales || currentWorkspace.factures_globales.length === 0) {
      alert("Dépose une facture globale !");
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

    try {
      const response = await fetch(`http://localhost:8000/workspaces/${activeId}/check-bl-in-facture`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setResultats(data);
          setShowResultPage(true);
          setProgress(0);
        }, 500);
      } else {
        const errorData = await response.json();
        clearInterval(interval);
        setLoading(false);
        setProgress(0);
        alert(`Erreur: ${errorData.detail}`);
      }
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      setProgress(0);
      alert("Erreur lors du traitement : " + error.message);
    }
  };

if (showResultPage) {
  return (
    <div className="bg-[#a18aff] min-h-screen w-full flex">
      <aside className="h-screen w-24 bg-[#e5e0f7] flex flex-col items-center py-6 z-20">
        <img src={logo} alt="Logo OS+" className="w-16 mb-6" />
      </aside>

      <div className="flex-1 min-h-screen flex flex-col items-center justify-center gap-8 p-12">
        <div className="bg-white text-black p-8 rounded-lg shadow max-w-md w-full flex flex-col items-center gap-4 ml-24">
      
          <img src={logo} alt="Logo OS+" className="w-24 mb-4" />
          <h2 className="text-xl font-bold mb-4 text-center">Résultat de la comparaison</h2>
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
        <button
          className="mt-17 px-10 py-8 bg-[#b6aaff] text-white rounded-full font-bold justify-center "
          onClick={() => setShowResultPage(false)}
        >
          Retour
        </button>
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
          ) : (
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
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{activeWs?.title}</span>
                    <span className="text-white/80">{activeWs?.subtitle}</span>
                    <button
                      className="ml-4 bg-[#b6aaff] hover:bg-[#a18aff] text-white rounded-lg px-4 py-2 text-lg transition"
                      onClick={handleEditTitle}
                    >
                      ✏️ Modifier
                    </button>
                  </div>
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

              <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Bons de livraison déposés</h3>
                <ul>
                  {activeWs?.documents && activeWs.documents.map((doc, idx) => (
                    <li key={doc.id} className="text-white flex items-center justify-between">
                      <a
                        href={`http://localhost:8000/uploads/workspace_${activeWs.id}/${doc.original_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {doc.original_filename}
                      </a>
                      <div className="flex gap-2">
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                  {(!activeWs?.documents || activeWs.documents.length === 0) && (
                    <li className="text-white/80">Aucun bon de livraison déposé.</li>
                  )}
                </ul>
              </div>
              <div className="flex-1 bg-[#b6aaff] rounded-xl p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Facture globale déposée</h3>
                <div>
                  {activeWs?.factures_globales && activeWs.factures_globales.length > 0 ? (
                    <div className="text-white flex items-center justify-between">
                      <a
                        href={`http://localhost:8000/uploads/workspace_${activeWs.id}/${activeWs.factures_globales[0].original_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {activeWs.factures_globales[0].original_filename}
                      </a>
                      <div className="flex gap-2">
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Supprimer"
                          onClick={() => handleDeleteDoc(activeWs.factures_globales[0].id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/80">Vous n'avez pas encore déposé la facture globale.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="bg-white text-[#a18aff] rounded-full px-12 py-3 text-lg font-bold hover:bg-[#b6aaff] hover:text-white transition disabled:opacity-50"
                  onClick={handleTraiter}
                  disabled={!activeWs || !activeWs.documents || activeWs.documents.length === 0 || !activeWs.factures_globales || activeWs.factures_globales.length === 0 || loading}
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
          )}
          {totalPages > 1 && (
            <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} />
          )}
        </main>
      </div>
    </div>
  );
}