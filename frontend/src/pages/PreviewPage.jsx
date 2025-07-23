import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import CreateModal from "../components/CreateModal.jsx";

function PreviewsPage() {
  const [previews, setPreviews] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreate = (newPreview) => {
    const updated = [newPreview, ...previews];
    setPreviews(updated);
    localStorage.setItem("newPreview", JSON.stringify(updated)); 
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <FiFileText size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              Repo: <span className="text-blue-400">{repoName || "Loading..."}</span>
            </h1>
          </div>
          <button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            Create
          </button>
        </div>

        {/* Previews Section */}
        <div className="bg-[#161b22] rounded-lg shadow-xl border border-[#30363d] overflow-hidden">
          <div className="bg-[#21262d] px-6 py-4 border-b border-[#30363d]">
            <h2 className="text-lg font-semibold text-white">Previews</h2>
          </div>

          <div className="divide-y divide-[#30363d]">
            {previews.map((preview, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between px-6 py-4 hover:bg-[#21262d] transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FiFileText className="text-blue-400 w-5 h-5" />
                  </div>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline truncate flex-1"
                  >
                    {preview.previewName}
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(idx)}
                  className="ml-4 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md transition-all duration-200 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            {previews.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FiFileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No previews available</p>
                <p className="text-gray-500 text-sm mt-2">Click "Create" to add your first preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-center">
          <div className="bg-[#161b22] rounded-lg px-4 py-2 border border-[#30363d]">
            <span className="text-gray-400 text-sm">
              {previews.length} preview{previews.length !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>
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
