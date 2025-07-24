import { useEffect, useState } from "react";

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

  // localStorage'dan gerekli bilgileri al
  const repoUrl = localStorage.getItem("repoUrl");
  const token = localStorage.getItem("token");

  if (!repoUrl || !token) {
    return alert("repoUrl veya token eksik. Lütfen repo bağlantısı yapın.");
  }

  // PR numarasını URL'den çıkar
  const prNumber = selected.url.split("/").pop();

  // Backend'in beklediği formatta veri hazırla
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
    .then((response) => {
      // Başarılıysa localStorage'a kaydet ve UI'ı güncelle
      const previewData = {
        url: response.previewUrl || selected.url,
        previewName: selected.title || "Unnamed PR",
        prNumber: prNumber,
        mode: response.mode || 'production'
      };
      
      localStorage.setItem("selectedPr", JSON.stringify(previewData));
      
      // Success message göster
      alert(`✅ Preview ${response.mode === 'test' ? '(TEST MODE)' : ''} oluşturuldu!\n\nURL: ${previewData.url}\nPR: ${previewData.previewName}`);
      
      onSubmit(previewData);
    })
    .catch((err) => {
      console.error("Backend'e istek atılamadı:", err);
      alert("Preview oluşturulamadı. Detaylar console'da.");
    });
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#161b22] p-6 rounded-lg border border-[#30363d] w-[500px] shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Select a Pull Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Dropdown */}
        <select
          className="w-full px-3 py-2 mb-4 rounded-md border border-[#30363d] bg-[#0d1117] text-white"
          value={selectedPr}
          onChange={(e) => setSelectedPr(e.target.value)}
        >
          <option value="">-- Select PR --</option>
          {prs.map((pr, idx) => (
            <option key={idx} value={pr.url}>
              {pr.previewName || pr.title || `PR ${idx + 1}`}
            </option>
          ))}
        </select>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-md font-semibold"
        >
          Create Preview
        </button>
      </div>
    </div>
  );
}

export default CreateModal;
