import { useState, useEffect } from "react";

function CreatePage() {
  const [imageTag, setImageTag] = useState("");
  const [selectedPr, setSelectedPr] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const prs = JSON.parse(localStorage.getItem("prs") || "[]");

  const handleCreate = () => {
    if (!selectedPr || !imageTag) return alert("PR ve Image Tag gerekli.");
    const url = `https://preview.example.com/pr-${selectedPr.number}/image:${imageTag}`;
    setPreviewUrl(url);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">🧪 Create PR test environment</h1>

      <input
        type="text"
        placeholder="Image Tag"
        className="bg-gray-900 p-2 rounded w-full max-w-md mb-4"
        value={imageTag}
        onChange={(e) => setImageTag(e.target.value)}
      />

      <select
        onChange={(e) => setSelectedPr(prs[e.target.value])}
        className="bg-gray-900 p-2 rounded w-full max-w-md mb-4"
      >
        <option>-- Pull Request Seç --</option>
        {prs.map((pr, index) => (
          <option key={pr.id} value={index}>
            #{pr.number} - {pr.title}
          </option>
        ))}
      </select>

      <button
        onClick={handleCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        Create
      </button>

      {previewUrl && (
        <div className="mt-6">
          <p className="text-green-400 font-semibold">Preview URL:</p>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="underline text-blue-400">
            {previewUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default CreatePage;
