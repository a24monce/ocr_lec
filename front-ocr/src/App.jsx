import React, { useState, useEffect, useRef } from "react";
import logo from "./assets/logo-osplus.png";

// Handlers

import { handleBlFilesChange } from "./handlers/handleBlFilesChange";
import { handleFactureFileChange } from "./handlers/handleFactureFileChange";
import { handleCreateWorkspace } from "./handlers/handleCreateWorkspace";

import {
  listWorkspaces,
  getWorkspace,
  deleteWorkspace,
} from "./lib/workspace";

import{
  deleteBL,
  deleteFacture,
  getBL,
  getFacture,
} from "./lib/facture";

// Composants
import Sidebar from "./components/Sidebar";
import DocumentList from "./components/DocumentList";
import FactureList from "./components/FactureList";
import FileUploadButtons from "./components/FileUploadButtons";
import Pagination from "./components/pagination";
import Traiter from "./components/Traiter";
import PrincipalPage from "./components/PrincipalPage";
import ResultPage from "./components/ResultPage";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";
import TitreWorkspace from "./components/TitreWorkspace";
import PageRecherche from "./components/PageRecherche";


export default function App() {
  // États globaux
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultats, setResultats] = useState(null);
  const [showResultPage, setShowResultPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);


  const blInputRef = useRef();
  const factureInputRef = useRef();


  // Charger workspaces au démarrage
  useEffect(() => {
    loadWorkspaces(); 
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeId) {
        setActiveId(data[0].id);
        setCurrentWorkspace(data[0]);
      }
    } catch (error) {
      console.error("Erreur chargement workspaces:", error);
    }
  };

  const onBack = () => setShowResultPage(false);

  const loadWorkspace = async (workspaceId) => {
    try {
      const ws = await getWorkspace(workspaceId);
      const bls = await getBL(workspaceId);
      const facture = await getFacture(workspaceId);
      setCurrentWorkspace({
      ...ws,
      documents: bls,
      facture_globale: facture,
    });
    } catch (error) {
      console.error("Erreur chargement workspace:", error);
    }
  };
  
  // ✅ Page résultats
  if (showResultPage) {
    return (
      <ResultPage
        onNewWorkspace={() => {
          onBack();
          setShowCreateModal(true);
        }}
        onShowSearch={() => {
          onBack();
          setShowSearch(true);
        }}
        showSearch={showSearch}
        onSelectWorkspace={async (id) => {
          onBack();
          setActiveId(id);
          await loadWorkspace(id);
          setShowResultPage(false);
        }}
        
        logo={logo}
        resultats={resultats}
        
      />
    );
  }

  // ✅ Page recherche
  if (showSearch) {
  return (
    <>
      <PageRecherche
        logo={logo}
        onNewWorkspace={() => setShowCreateModal(true)}
        onShowSearch={() => setShowSearch(true)}
        showSearch={showSearch}
        onSelectWorkspace={async (id) => {
        setActiveId(id);
        await loadWorkspace(id);   
        setShowSearch(false);      
      }}
      onDelete={async (id) => {
        await deleteWorkspace(id);
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
      }}
      />
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => handleCreateWorkspace(data, setWorkspaces, setActiveId, setCurrentWorkspace, setShowSearch)}
        />
      )}
    </>
  );
}


  // ✅ Page principale
  return (
    <div className="bg-[#a18aff] min-h-screen w-full flex">
      <Sidebar
        logo={logo}
        onNewWorkspace={() => setShowCreateModal(true)}
        onShowSearch={() => setShowSearch(true)}
        showSearch={showSearch}
      />

        <main className="flex-1 ml-24 p-10 bg-[#a18aff] overflow-y-auto">
        {workspaces.length === 0 ? (
          <PrincipalPage />
        ) : (
          <>
            <TitreWorkspace
              currentWorkspace={currentWorkspace}
              setCurrentWorkspace={setCurrentWorkspace}
              setWorkspaces={setWorkspaces}
            />
            

            {/* Liste documents */}
            <DocumentList
              workspaceId={activeId}
              documents={currentWorkspace?.documents || []}
              currentPage={currentPage}
              onDelete={async (docId) => {
                await deleteBL(activeId, docId);
                setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
              }}
            />

            {/* Liste factures */}
            <FactureList
              workspaceId={activeId}
              document={currentWorkspace?.facture_globale || []}
              currentPage={currentPage}
              onDelete={async (doc) => {
                await deleteFacture(activeId, doc);
                setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
              }}
            />

            {/* Upload fichiers */}
            <div className="flex gap-4 mt-6">
              <FileUploadButtons
            onBlUpload={(e) => handleBlFilesChange(e, activeId, setCurrentWorkspace)}
            onFactureUpload={(e) => handleFactureFileChange(e, activeId, setCurrentWorkspace)}
              />
            </div>
            {/* Bouton traiter */}
            <Traiter
             workspaceId={activeId}
            onResult={(data) => {
            setResultats(data);
            setShowResultPage(true);
  }}
            />
            {/* Pagination */}
            <Pagination
              current={currentPage}
              total={Math.ceil(
                (currentWorkspace?.documents?.length || 0) / 5
              )}
              onPageChange={setCurrentPage}
            />  
          </>
        )}
      </main>
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => handleCreateWorkspace(data, setWorkspaces, setActiveId, setCurrentWorkspace, setShowSearch)}
        />
      )}
    </div>
  );
}