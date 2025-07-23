import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/SnekHub.png"; 

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

      navigate("/preview");
    } catch (err) {
      console.error("Connection error:", err);
      alert("Bağlantı kurulamadı veya PR listesi çekilemedi.");
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4 -mt-20 " >
  <div className="flex flex-col items-center bg-[#161b22] px-12 py-12 rounded-xl shadow-md border border-[#30363d] w-[800px] h-[500px]  space-y-12">
    {/* Logo */}
    <img src={logo} alt="GitHub" className="w-12 h-12 max-w-[12rem] max-h-[12rem] object-contain" />
    
    {/* Başlık */}
    <h1 className="text-white text-[36px] font-bold text-center leading-tight">
      <div>SnekHub</div>
      <div className="text-[24px] font-normal">Connect to Your Repository </div>
    </h1>

    {/* Form */}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleConnect();
      }}
      className="flex flex-col items-center space-y-12"
      style={{
    display: "flex",
    flexDirection: "column",
    gap: "1px",         // ← Aradaki boşluk (20px) burada
    alignItems: "center" // opsiyonel: öğeleri yatayda ortalamak için
  }}
    >
      {/* Repo URL */}
      <div>
        <label className="w-[360px] text-white mb-1 block">
          GitHub Repository URL
        </label>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="w-[360px] px-3 py-2 rounded-md border border-[#30363d] bg-[#0d1117] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Token */}
      <div>
        <label className="text-sm text-white mb-1 block">
          GitHub Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="••••••••"
          className="w-[360px] px-3 py-2 rounded-md border border-[#30363d] bg-[#0d1117] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>  

      {/* Button */}
      <button
        type="submit"
         className="mt-20 w-[160px] bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-md text-[12px] font-semibold transition"
      >
        Connect
      </button>
    </form>
  </div>
</div>


  );
}

export default ConnectPage;
