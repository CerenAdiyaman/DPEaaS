import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlusCircle, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import CreateModal from "../components/CreateModal.jsx";
import TestResultCard from "../components/TestResultCard.jsx";

function PreviewsPage() {
  const [previews, setPreviews] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "cards"
  const [isCleaning, setIsCleaning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const repoUrl = localStorage.getItem("repoUrl");
    const previewsRaw = localStorage.getItem("newPreview");

    if (repoUrl) setRepoName(repoUrl.split("/").pop() || "");

    if (previewsRaw) {
      try {
        const parsed = JSON.parse(previewsRaw);
        setPreviews(parsed);
      } catch (e) {
        console.error("Failed to parse created previews:", e);
      }
    }
  }, []);

  const handleDelete = (i) => {
    const updated = previews.filter((_, idx) => idx !== i);
    setPreviews(updated);
    localStorage.setItem("newPreview", JSON.stringify(updated));
  };

  const handleCleanupAll = async () => {
    if (!confirm("Tüm aktif deployment'ları ve portları temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    setIsCleaning(true);
    try {
      // Önce tüm PR'ları temizle
      const previewsToClean = [...previews];
      let successCount = 0;
      
      for (const preview of previewsToClean) {
        try {
          // PR numarasını URL'den çıkar (örn: "PR #123" -> "123")
          const prMatch = preview.previewName.match(/PR #(\d+)/);
          if (prMatch) {
            const prNumber = prMatch[1];
            
            const response = await fetch('/api/repo/cleanup-pr', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prNumber: parseInt(prNumber) }),
            });

            const result = await response.json();
            
            if (result.status === 'success') {
              successCount++;
              console.log(`✅ PR ${prNumber} cleaned successfully`);
            } else {
              console.warn(`⚠️ Failed to clean PR ${prNumber}:`, result.error);
            }
          }
        } catch (error) {
          console.error(`❌ Error cleaning preview:`, error);
        }
      }
      
      if (successCount > 0) {
        alert(`✅ ${successCount} deployment başarıyla temizlendi!`);
        // Preview listesini temizle
        setPreviews([]);
        localStorage.removeItem("newPreview");
      } else {
        alert('❌ Hiçbir deployment temizlenemedi');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('❌ Temizlik sırasında hata oluştu: ' + error.message);
    } finally {
      setIsCleaning(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreate = (newPreview) => {
    const updated = [newPreview, ...previews];
    setPreviews(updated);
    localStorage.setItem("newPreview", JSON.stringify(updated));
    closeModal();
  };

  const getSuccessCount = () => {
    return previews.filter(preview => preview.status === 'Active').length;
  };

  const getFailedCount = () => {
    return previews.filter(preview => preview.status === 'Failed').length;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#21262d] flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 w-full">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Repo: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">{repoName || "Loading..."}</span>
            </h1>
            <p className="text-gray-400 mt-2">Preview ortamları ve test sonuçları</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[#161b22] rounded-lg p-1 border border-[#30363d]">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Kartlar
              </button>
            </div>
            {/* Cleanup All Button */}
            <button
              onClick={handleCleanupAll}
              disabled={isCleaning}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-3 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <FiRefreshCw size={20} className={isCleaning ? "animate-spin" : ""} />
              {isCleaning ? "Temizleniyor..." : "Tümünü Temizle"}
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-600 hover:to-blue-600 text-white px-7 py-3 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <FiPlusCircle size={22} /> Create
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161b22]/80 rounded-xl border border-[#30363d] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Preview</p>
                <p className="text-white text-2xl font-bold">{previews.length}</p>
              </div>
              <FiFileText className="text-blue-400 w-8 h-8" />
            </div>
          </div>
          <div className="bg-[#161b22]/80 rounded-xl border border-[#30363d] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Başarılı</p>
                <p className="text-green-400 text-2xl font-bold">{getSuccessCount()}</p>
              </div>
              <FiCheckCircle className="text-green-400 w-8 h-8" />
            </div>
          </div>
          <div className="bg-[#161b22]/80 rounded-xl border border-[#30363d] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Başarısız</p>
                <p className="text-red-400 text-2xl font-bold">{getFailedCount()}</p>
              </div>
              <FiXCircle className="text-red-400 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "list" ? (
          /* List View */
          <div className="bg-[#161b22]/80 rounded-2xl shadow-2xl border border-[#30363d] overflow-hidden backdrop-blur-md">
            <div className="bg-[#21262d]/90 px-8 py-5 border-b border-[#30363d] flex items-center">
              <h2 className="text-2xl font-semibold text-white tracking-wide">Previews</h2>
            </div>

            <div className="divide-y divide-[#30363d]">
              {previews.map((preview, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between px-8 py-5 hover:bg-[#21262d]/80 transition-all duration-200"
                >
                  <div className="flex items-center space-x-5 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <FiFileText className="text-blue-400 w-7 h-7" />
                    </div>
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-green-400 hover:underline truncate flex-1 text-lg font-medium transition-colors duration-200"
                    >
                      {preview.previewName}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="ml-6 flex items-center gap-1 text-red-400 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 text-base font-semibold"
                  >
                    <FiTrash2 size={18} /> Delete
                  </button>
                </div>
              ))}
              {previews.length === 0 && (
                <div className="px-8 py-20 text-center flex flex-col items-center justify-center animate-fade-in">
                  <FiFileText className="w-16 h-16 text-gray-500 animate-bounce mb-6" />
                  <p className="text-gray-400 text-2xl font-semibold">No previews available</p>
                  <p className="text-gray-500 text-base mt-2">Click <span className="text-blue-400 font-bold">"Create"</span> to add your first preview</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {previews.map((preview, idx) => (
              <TestResultCard
                key={idx}
                preview={preview}
                onRefresh={() => {
                  // Refresh logic can be added here
                }}
                onDelete={() => handleDelete(idx)}
              />
            ))}
            {previews.length === 0 && (
              <div className="col-span-full px-8 py-20 text-center flex flex-col items-center justify-center animate-fade-in">
                <FiFileText className="w-16 h-16 text-gray-500 animate-bounce mb-6" />
                <p className="text-gray-400 text-2xl font-semibold">No previews available</p>
                <p className="text-gray-500 text-base mt-2">Click <span className="text-blue-400 font-bold">"Create"</span> to add your first preview</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default PreviewsPage;
