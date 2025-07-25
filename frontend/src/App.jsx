import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnectPage from './pages/ConnectPage.jsx';
import CreateModal from './components/CreateModal.jsx';
import PreviewPage from './pages/PreviewPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route path="/create" element={<CreateModal  />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
    
  );
}



export default App;
