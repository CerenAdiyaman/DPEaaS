import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlusCircle, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import CreateModal from "../components/CreateModal.jsx";
import TestResultCard from "../components/TestResultCard.jsx";

function PreviewsPage() {
  const [previews, setPreviews] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); 
  const [testResults, setTestResults] = useState({});
  const [loadingTests, setLoadingTests] = useState({});
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

  const fetchTestResult = async (prNumber) => {
    setLoadingTests(prev => ({ ...prev, [prNumber]: true }));
    
    try {
      const response = await fetch(`http://localhost:8080/create-preview/test/${prNumber}`);
      if (!response.ok) {
        throw new Error('Could not get test result');
      }
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [prNumber]: result }));
    } catch (err) {
      console.error('Test result fetch error:', err);
      setTestResults(prev => ({ ...prev, [prNumber]: { error: err.message } }));
    } finally {
      setLoadingTests(prev => ({ ...prev, [prNumber]: false }));
    }
  };

  const handleDelete = async (i) => {
    const preview = previews[i];
    
    // PR numarasını preview objesinden al
    const prNumber = preview.prNumber;
    if (!prNumber) {
      alert('PR number not found');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/create-preview/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prNumber: prNumber }),
      });

      if (!response.ok) {
        throw new Error('Preview silme başarısız');
      }

      const result = await response.json();
      console.log('Delete result:', result);
      
      // Local storage'dan da sil
      const updated = previews.filter((_, idx) => idx !== i);
      setPreviews(updated);
      localStorage.setItem("newPreview", JSON.stringify(updated));
      
      alert(`✅ Preview deleted successfully!\n\nPR #${prNumber}`);
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Error deleting preview: ' + error.message);
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
            <p className="text-gray-400 mt-2">Preview environments and test results</p>
          </div>
          <div className="flex items-center gap-3">
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
                  <p className="text-gray-400 text-sm">Total Previews</p>
                  <p className="text-white text-2xl font-bold">{previews.length}</p>
                </div>
                <FiFileText className="text-blue-400 w-8 h-8" />
              </div>
            </div>
            <div className="bg-[#161b22]/80 rounded-xl border border-[#30363d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Successful</p>
                  <p className="text-green-400 text-2xl font-bold">{getSuccessCount()}</p>
                </div>
                <FiCheckCircle className="text-green-400 w-8 h-8" />
              </div>
            </div>
            <div className="bg-[#161b22]/80 rounded-xl border border-[#30363d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-red-400 text-2xl font-bold">{getFailedCount()}</p>
                </div>
                <FiXCircle className="text-red-400 w-8 h-8" />
              </div>
            </div>
        </div>

        {/* Content */}
        <div className="bg-[#161b22]/80 rounded-2xl shadow-2xl border border-[#30363d] overflow-hidden backdrop-blur-md">
          <div className="bg-[#21262d]/90 px-8 py-5 border-b border-[#30363d] flex items-center">
            <h2 className="text-2xl font-semibold text-white tracking-wide">Previews</h2>
          </div>

          <div className="divide-y divide-[#30363d]">
            {previews.map((preview, idx) => (
              <React.Fragment key={idx}>
                <div
                  className="group flex items-center justify-between px-8 py-5 hover:bg-[#21262d]/80 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    // PR numarasını preview objesinden al
                    const prNumber = preview.prNumber;
                    if (prNumber) {
                      // Test sonuçlarını çek
                      if (!testResults[prNumber]) {
                        fetchTestResult(prNumber);
                      }
                    }
                    
                    // Test sonuçlarını göster
                    const testResultCard = document.getElementById(`test-result-${idx}`);
                    if (testResultCard) {
                      testResultCard.style.display = testResultCard.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  <div className="flex items-center space-x-5 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <FiFileText className="text-blue-400 w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-blue-400 hover:text-green-400 truncate text-lg font-medium transition-colors duration-200">
                        {preview.previewName}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">Click to view test results</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(idx);
                    }}
                    className="ml-6 flex items-center gap-1 text-red-400 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 text-base font-semibold"
                  >
                    <FiTrash2 size={18} /> Delete
                  </button>
                </div>
                
                {/* Test Results Section */}
                <div 
                  id={`test-result-${idx}`} 
                  className="px-8 py-6 bg-[#0d1117] border-t border-[#30363d] hidden"
                  style={{ display: 'none' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold text-lg">Test Results</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const prNumber = preview.prNumber;
                        if (prNumber) {
                          fetchTestResult(prNumber);
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-500/10"
                    >
                      <FiRefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Test Status */}
                    <div className="flex items-center justify-between p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
                      <span className="text-gray-300 text-sm">Test Status:</span>
                      <span className="text-green-400 font-semibold">Successful</span>
                    </div>

                    {/* PR Number */}
                    <div className="flex items-center justify-between p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
                      <span className="text-gray-300 text-sm">PR Number:</span>
                      <span className="text-gray-400 font-mono">#{preview.prNumber}</span>
                    </div>

                    {/* Test Result */}
                    <div className="flex items-center justify-between p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
                      <span className="text-gray-300 text-sm">Test Result:</span>
                      <span className="text-gray-400 text-sm">Test completed successfully</span>
                    </div>

                    {/* Test Time */}
                    <div className="flex items-center justify-between p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
                      <span className="text-gray-300 text-sm">Test Time:</span>
                      <span className="text-gray-400 text-sm">
                        {new Date().toLocaleString('en-US')}
                      </span>
                    </div>

                    {/* HTTP Code (if available) */}
                    {preview.testDetails?.httpCode && (
                      <div className="flex items-center justify-between p-3 bg-[#161b22] rounded-lg border border-[#30363d]">
                        <span className="text-gray-300 text-sm">HTTP Code:</span>
                        <span className={`font-mono text-sm ${
                          preview.testDetails.httpCode >= 200 && preview.testDetails.httpCode < 400 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {preview.testDetails.httpCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
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
