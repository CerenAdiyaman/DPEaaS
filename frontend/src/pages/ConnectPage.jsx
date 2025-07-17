import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ConnectPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (!repoUrl || !token) return alert("Repo URL ve Token girilmelidir.");
    try {
      const res = await axios.post("http://localhost:8080/api/connect-repo", {
        repoUrl,
        token,
      });

      localStorage.setItem("repoUrl", repoUrl);
      localStorage.setItem("token", token);
      localStorage.setItem("prs", JSON.stringify(res.data));

      navigate("/create");
    } catch (err) {
      console.error("Bağlantı hatası:", err);
      alert("Bağlantı kurulamadı veya PR listesi çekilemedi.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">🔗 Connect to Repo</h1>

      <input
        type="text"
        placeholder="https://github.com/username/repo"
        className="bg-gray-900 p-2 w-full max-w-md mb-4 rounded"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />

      <input
        type="password"
        placeholder="GitHub Token"
        className="bg-gray-900 p-2 w-full max-w-md mb-4 rounded"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={handleConnect}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        Connect
      </button>
    </div>
  );
}

export default ConnectPage;
