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
      const res = await axios.post("http://localhost:8080/connect-repo", {
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
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    </div>
      <div className="bg-[#0d1117] text-white w-full max-w-md space-y-8">
        <div className="flex items-center justify-center space-x-3">
          <h1 className="text-xl font-semibold">Connect to Repo</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              GitHub Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full p-3 rounded-md bg-[#161b22] border border-gray-600 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">GitHub Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-md bg-[#161b22] border border-gray-600 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConnectPage;
