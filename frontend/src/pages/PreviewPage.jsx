import { useState } from "react";

function PreviewsPage() {
  const [previews, setPreviews] = useState([
    "https://example.com/preview1",
    "https://example.com/preview2",
    "https://example.com/preview3",
  ]);

  const handleDelete = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-4">🧪 Previews</h1>
      {previews.map((url, index) => (
        <div key={index} className="flex items-center justify-between mb-3">
          <a href={url} className="text-blue-400 underline" target="_blank" rel="noreferrer">
            {url}
          </a>
          <button
            onClick={() => handleDelete(index)}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default PreviewsPage;
