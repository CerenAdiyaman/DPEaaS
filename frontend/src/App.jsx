import { useState } from 'react';
import axios from 'axios';
import pullIcon from './assets/pull.png'; // buraya senin görselin

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [prs, setPrs] = useState([]);
  const [selectedPr, setSelectedPr] = useState(null);
  const [imageTag, setImageTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const extractOwnerRepo = (url) => {
    try {
      const [owner, repo] = url.replace('https://github.com/', '').split('/');
      return { owner, repo };
    } catch {
      return null;
    }
  };


  const fetchPRs = async () => {
    if (!repoUrl) return alert('Please enter a GitHub repository URL');

    try {
      const res = await axios.post('http://localhost:8080/generate-preview', {
        repoUrl,
        token,
      });
      setPrs(res.data);
    } catch (err) {
      console.error('Failed to fetch PRs from backend:', err);
      alert('Failed to connect to backend or fetch PRs.');
    }
  };

  const generatePreviewUrl = () => {
  if (!selectedPr) {
    alert("Please enter a Pull Request ID");
    return;
  }
  if (!imageTag) {
    alert("Please enter an Image Tag");
    return;
  }
  const prId = selectedPr.number;
  const preview = `https://preview.example.com/pr/${prId}/image:${imageTag}`;
  setPreviewUrl(preview);
 };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'sans-serif' }}>
      <img src={pullIcon} alt="Pull Request Icon" style={{ width: 50 }} />
      <h2>Pull Request Preview Generator</h2>

      <input
        placeholder="GitHub Repo URL (https://github.com/user/repo)"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        placeholder="GitHub Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={fetchPRs}>Connect to Repo</button>

      {prs.length > 0 && (
        <>
          <select onChange={(e) => setSelectedPr(prs[e.target.value])} style={{ marginTop: 20 }}>
            <option>-- PR Seç --</option>
            {prs.map((pr, i) => (
              <option key={pr.id} value={i}>
                #{pr.number} - {pr.title} ({pr.user.login})
              </option>
            ))}
          </select>

          <input
            placeholder="Image Tag"
            value={imageTag}
            onChange={(e) => setImageTag(e.target.value)}
            style={{ marginTop: 10, width: '100%' }}
          />

          <button onClick={generatePreviewUrl} style={{ marginTop: 10 }}>Preview URL Oluştur</button>
        </>
      )}

      {previewUrl && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Preview URL:</strong></p>
          <a href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
        </div>
      )}
    </div>
  );
}

export default App;
