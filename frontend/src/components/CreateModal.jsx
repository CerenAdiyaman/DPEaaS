import { useEffect, useState } from "react";
import { FiX, FiGitPullRequest } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function CreateModal({ isOpen, onClose, onSubmit }) {
  const [prs, setPrs] = useState([]);
  const [selectedPr, setSelectedPr] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("prs"));
      if (stored && Array.isArray(stored.pullRequests)) {
        setPrs(stored.pullRequests);
      } else {
        setPrs([]);
      }
    } catch (err) {
      console.error("PR parsing error:", err);
      setPrs([]);
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedPr) return alert("Lütfen bir PR seçin.");

    const selected = prs.find(pr => pr.url === selectedPr);
    if (!selected) return alert("Seçilen PR bulunamadı.");

    // Get required information from localStorage
    const repoUrl = localStorage.getItem("repoUrl");
    const token = localStorage.getItem("token");

    if (!repoUrl || !token) {
      return alert("repoUrl veya token eksik. Lütfen repo bağlantısı yapın.");
    }

    // Extract PR number from URL
    const prNumber = selected.url.split("/").pop();

    // Prepare data in the format expected by the backend
    const payload = {
      repoUrl,
      token,
      prNumber
    };

    fetch("http://localhost:8080/create-preview/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
      .then((data) => {
        console.log('Backend response:', data); // Debug 
        // Use the actual URL from the backend response
        const previewData = {
          url: data.url, // Actual URL
          previewName: selected.previewName || selected.title || "Unnamed PR",
        };
        
        console.log('Preview data:', previewData); // Debug 
        
        // If success, save to localStorage and submit
        localStorage.setItem("newPreview", JSON.stringify(previewData));
        onSubmit(previewData);
      })
      .catch((err) => {
        console.error("Backend'e istek atılamadı:", err);
        alert("Preview oluşturulamadı.");
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
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

            {/* Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md"
            >
              Create Preview
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreateModal;
