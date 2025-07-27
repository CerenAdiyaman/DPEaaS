import { useEffect, useState } from "react";
import { FiX, FiGitPullRequest } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function CreateModal({ isOpen, onClose, onSubmit }) {
  const [prs, setPrs] = useState([]);
  const [selectedPr, setSelectedPr] = useState("");

  useEffect(() => {
    console.log('🔍 DEBUG - CreateModal useEffect triggered');
    console.log('🔍 DEBUG - isOpen:', isOpen);
    
    // Test verisi ekle
    const testPrs = [
      { url: "https://github.com/test/repo/pull/1", previewName: "Test PR 1", title: "Test PR 1" },
      { url: "https://github.com/test/repo/pull/2", previewName: "Test PR 2", title: "Test PR 2" },
      { url: "https://github.com/test/repo/pull/3", previewName: "Test PR 3", title: "Test PR 3" }
    ];
    
    try {
      const stored = JSON.parse(localStorage.getItem("prs"));
      console.log('🔍 DEBUG - Stored PRs from localStorage:', stored);
      if (stored && Array.isArray(stored.pullRequests)) {
        console.log('🔍 DEBUG - Setting PRs:', stored.pullRequests);
        setPrs(stored.pullRequests);
      } else {
        console.log('🔍 DEBUG - No valid PRs found, using test data');
        setPrs(testPrs);
      }
    } catch (err) {
      console.error("🔍 DEBUG - PR parsing error:", err);
      console.log('🔍 DEBUG - Using test data due to error');
      setPrs(testPrs);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    console.log('🔍 DEBUG - handleSubmit called');
    if (!selectedPr) {
      alert("Lütfen bir PR seçin.");
      return;
    }

    const selected = prs.find(pr => pr.url === selectedPr);
    if (!selected) {
      alert("Seçilen PR bulunamadı.");
      return;
    }

    console.log('🔍 DEBUG - Selected PR:', selected);

    // Get required information from localStorage
    const repoUrl = localStorage.getItem("repoUrl");
    const token = localStorage.getItem("token");

    if (!repoUrl || !token) {
      alert("repoUrl veya token eksik. Lütfen repo bağlantısı yapın.");
      return;
    }

    // Extract PR number from URL
    const prNumber = selected.url.split("/").pop();

    // Prepare data in the format expected by the backend
    const payload = {
      repoUrl,
      token,
      prNumber
    };

    console.log('🔍 DEBUG - About to send request to backend');
    console.log('🔍 DEBUG - Payload:', payload);
    
          fetch("http://localhost:8080/create-preview/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('🔍 DEBUG - Response status:', res.status);
        console.log('🔍 DEBUG - Response ok:', res.ok);
        if (!res.ok) {
          console.log('🔍 DEBUG - Response not ok, throwing error');
          throw new Error("Backend error");
        }
        console.log('🔍 DEBUG - Response ok, parsing JSON');
        return res.json();
      })
      .then((data) => {
        console.log('🔍 DEBUG - Backend response:', data);
        console.log('🔍 DEBUG - Backend response type:', typeof data);
        console.log('🔍 DEBUG - Backend response.url:', data.url);
        
        // URL'nin geçerli olup olmadığını kontrol et
        if (!data.url || data.url.includes('minikube service')) {
          console.warn('🔍 DEBUG - Invalid URL received from backend:', data.url);
          alert(`Preview oluşturuldu ancak URL henüz hazır değil.\n\nBackend URL: ${data.url}\n\nLütfen birkaç dakika bekleyin ve sayfayı yenileyin.`);
        }
        
        // Use the actual URL from the backend response
        const previewData = {
          url: data.url,
          previewName: selected.previewName || selected.title || "Unnamed PR",
          prNumber: prNumber,
          namespace: data.resources?.namespace,
          deployment: data.resources?.deployment,
          service: data.resources?.service,
          status: 'Active',
          deployedAt: new Date().toISOString()
        };
        
        console.log('🔍 DEBUG - Preview data to save:', previewData);
        
        // If success, save to localStorage and submit
        const existingPreviews = JSON.parse(localStorage.getItem("newPreview") || "[]");
        console.log('🔍 DEBUG - Existing previews:', existingPreviews);
        console.log('🔍 DEBUG - Existing previews type:', typeof existingPreviews);
        console.log('🔍 DEBUG - Existing previews is array:', Array.isArray(existingPreviews));
        
        const updatedPreviews = [previewData, ...existingPreviews];
        console.log('🔍 DEBUG - Updated previews:', updatedPreviews);
        console.log('🔍 DEBUG - Updated previews length:', updatedPreviews.length);
        
        localStorage.setItem("newPreview", JSON.stringify(updatedPreviews));
        console.log('🔍 DEBUG - Saved to localStorage');
        console.log('🔍 DEBUG - localStorage after save:', localStorage.getItem("newPreview"));
        
        onSubmit(previewData);
      })
      .catch((err) => {
        console.error("🔍 DEBUG - Error in fetch:", err);
        console.error("🔍 DEBUG - Error message:", err.message);
        console.error("🔍 DEBUG - Error stack:", err.stack);
        alert("Preview oluşturulamadı. Hata: " + err.message);
      });
  };

  console.log('🔍 DEBUG - CreateModal render, isOpen:', isOpen);
  console.log('🔍 DEBUG - CreateModal prs:', prs);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[99999] !important"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#161b22] px-12 py-10 rounded-2xl border border-[#30363d] w-[95vw] max-w-[520px] shadow-xl relative"
            style={{ zIndex: 100000 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-lg font-bold">Select a Pull Request</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-700/30 focus:outline-none"
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {/* Dropdown */}
            {prs.length > 0 ? (
              <select
                className="w-full px-3 py-2 mb-6 rounded-lg border border-[#30363d] bg-[#0d1117] text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                value={selectedPr}
                onChange={(e) => setSelectedPr(e.target.value)}
              >
                <option value="">-- Select PR --</option>
                {prs.map((pr, idx) => (
                  <option key={idx} value={pr.url} className="text-black">
                    {pr.previewName || pr.title || `PR ${idx + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-4 mb-6 rounded-lg border border-[#30363d] bg-[#0d1117] text-center">
                <p className="text-gray-400 text-sm mb-2">No PRs available</p>
                <p className="text-gray-500 text-xs">Please connect to a repository first</p>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={prs.length === 0}
              className={`w-full py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md ${
                prs.length > 0 
                  ? 'bg-[#238636] hover:bg-[#2ea043] text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {prs.length > 0 ? 'Create Preview' : 'No PRs Available'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateModal;
