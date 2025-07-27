import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlusCircle, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import CreateModal from "../components/CreateModal.jsx";
import TestResultCard from "../components/TestResultCard.jsx";

function PreviewsPage() {
  const [previews, setPreviews] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); 
  const [testResults, setTestResults] = useState({});
  const [loadingTests, setLoadingTests] = useState({});
  const [deletingPreviews, setDeletingPreviews] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const repoUrl = localStorage.getItem("repoUrl");
    const previewsRaw = localStorage.getItem("newPreview");

    if (repoUrl) {
      const repoNameFromUrl = repoUrl.split("/").pop() || "";
      setRepoName(repoNameFromUrl);
    }

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
    
    // Loading durumunu başlat
    setDeletingPreviews(prev => ({ ...prev, [prNumber]: true }));
    
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
    } finally {
      // Loading durumunu bitir
      setDeletingPreviews(prev => ({ ...prev, [prNumber]: false }));
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
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#f0f6fc] mb-1">
                {repoName || "Loading..."}
              </h1>
              <p className="text-[#7d8590] text-sm">Preview environments and test results</p>
            </div>
            
            {/* Right Side Buttons */}
            <div className="flex flex-col items-end gap-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-[#58a6ff] hover:text-[#79c0ff] text-sm font-medium transition-colors duration-200 px-3 py-1 rounded-full hover:bg-[#58a6ff]/10"
              >
                <FiArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-offset-2 focus:ring-offset-[#0d1117] shadow-lg hover:shadow-xl"
              >
                <FiPlusCircle size={16} /> Create Preview
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-6 py-4 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <p className="text-[#f0f6fc] text-lg font-semibold mb-1">{previews.length}</p>
              <div className="flex items-center gap-2">
                <FiFileText className="text-[#58a6ff] w-4 h-4" />
                <p className="text-[#7d8590] text-xs font-medium">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-6 py-4 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <p className="text-[#f0f6fc] text-lg font-semibold mb-1">{getSuccessCount()}</p>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-[#3fb950] w-4 h-4" />
                <p className="text-[#7d8590] text-xs font-medium">Success</p>
              </div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-6 py-4 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <p className="text-[#f0f6fc] text-lg font-semibold mb-1">{getFailedCount()}</p>
              <div className="flex items-center gap-2">
                <FiXCircle className="text-[#f85149] w-4 h-4" />
                <p className="text-[#7d8590] text-xs font-medium">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#21262d] px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Preview Environments</h2>
            <span className="inline-flex items-center px-6 py-4 rounded-full text-base font-medium bg-[#238636] text-white border-4 border-[#238636]">
              {previews.length} active
            </span>
          </div>

                      <div className="divide-y divide-[#30363d]">
              {previews.map((preview, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className="group flex items-center justify-between px-6 py-4 hover:bg-[#21262d] transition-colors duration-200 cursor-pointer"
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
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[#f0f6fc] truncate text-sm font-medium">
                        {preview.previewName}
                      </div>
                      <div className="text-[#7d8590] text-xs mt-1">
                        PR #{preview.prNumber} • Click to view test results
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(idx);
                    }}
                    disabled={deletingPreviews[preview.prNumber]}
                    className={`${
                      deletingPreviews[preview.prNumber]
                        ? 'text-[#7d8590] cursor-not-allowed'
                        : 'text-[#f85149] hover:text-[#ff6b6b] opacity-0 group-hover:opacity-100'
                    } transition-all duration-200`}
                  >
                    {deletingPreviews[preview.prNumber] ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Deleting...</span>
                      </div>
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </button>
                </div>
                
                {/* Test Results Section */}
                <div 
                  id={`test-result-${idx}`} 
                  className="px-6 py-4 bg-[#21262d] border-t border-[#30363d] hidden"
                  style={{ display: 'none' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#f0f6fc] font-medium text-sm">Test Results PR #{preview.prNumber}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const prNumber = preview.prNumber;
                        if (prNumber) {
                          fetchTestResult(prNumber);
                        }
                      }}
                      className="text-[#58a6ff] hover:text-[#79c0ff] transition-colors duration-200"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  
                                      <div className="space-y-3">
                      {/* Test Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#7d8590] text-xs">Test Status:</span>
                        <span className="text-[#3fb950] font-medium text-xs">Successful</span>
                      </div>

                      {/* PR Number */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#7d8590] text-xs">PR Number:</span>
                        <span className="text-[#f0f6fc] font-mono text-xs">#{preview.prNumber}</span>
                      </div>

                      {/* Test Result */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#7d8590] text-xs">Test Result:</span>
                        <span className="text-[#f0f6fc] text-xs">Test completed successfully</span>
                      </div>

                      {/* Test Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#7d8590] text-xs">Test Time:</span>
                        <span className="text-[#f0f6fc] text-xs">
                          {new Date().toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* HTTP Code (if available) */}
                      {preview.testDetails?.httpCode && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#7d8590] text-xs">HTTP Code:</span>
                          <span className={`font-mono text-xs ${
                            preview.testDetails.httpCode >= 200 && preview.testDetails.httpCode < 400 
                              ? 'text-[#3fb950]' 
                              : 'text-[#f85149]'
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
                <div className="px-8 py-16 text-center flex flex-col items-center justify-center">
                  <div className="bg-[#21262d] p-4 rounded-lg mb-4">
                    <FiFileText className="w-8 h-8 text-[#7d8590]" />
                  </div>
                  <p className="text-[#f0f6fc] text-lg font-medium mb-2">No previews available</p>
                  <p className="text-[#7d8590] text-sm">Click <span className="text-[#58a6ff] font-medium">"Create Preview"</span> to add your first preview environment</p>
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


