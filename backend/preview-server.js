const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001; // Frontend'den farklı port

// Static files servis et
app.use(express.static(path.join(__dirname, 'preview-content')));

// PR preview'ı serve et
app.get('/pr-:prNumber', (req, res) => {
    const { prNumber } = req.params;
    
    // PR bilgilerini simüle et
    const mockContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PR #${prNumber} Preview - DPEaaS</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 40px 20px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: white;
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 600px;
                text-align: center;
            }
            .success-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            h1 { color: #2d3748; margin-bottom: 10px; }
            .pr-info {
                background: #f7fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #4299e1;
            }
            .status {
                display: inline-block;
                background: #48bb78;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            .details {
                margin: 20px 0;
                text-align: left;
            }
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .back-link {
                display: inline-block;
                margin-top: 20px;
                color: #4299e1;
                text-decoration: none;
                font-weight: 600;
            }
            .back-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">🚀</div>
            <h1>Preview Environment Active!</h1>
            <div class="status">TEST MODE</div>
            
            <div class="pr-info">
                <h3>Pull Request #${prNumber}</h3>
                <p>Bu PR'ın preview ortamı başarıyla oluşturuldu!</p>
            </div>
            
            <div class="details">
                <div class="detail-item">
                    <strong>PR Number:</strong>
                    <span>#${prNumber}</span>
                </div>
                <div class="detail-item">
                    <strong>Namespace:</strong>
                    <span>pr-${prNumber}</span>
                </div>
                <div class="detail-item">
                    <strong>Deployment:</strong>
                    <span>deployment-${prNumber}</span>
                </div>
                <div class="detail-item">
                    <strong>Service:</strong>
                    <span>service-${prNumber}</span>
                </div>
                <div class="detail-item">
                    <strong>Status:</strong>
                    <span>🟢 Running (Simulated)</span>
                </div>
            </div>
            
            <p><strong>📝 Not:</strong> Bu test modunda çalışan bir simülasyon preview'ıdır. 
            Gerçek Kubernetes deployment'ı için Docker ve kubectl kurulumu gereklidir.</p>
            
            <a href="http://localhost:5173" class="back-link">← DPEaaS Admin Panel'e Dön</a>
        </div>
    </body>
    </html>
    `;
    
    res.send(mockContent);
});

// Ana sayfa
app.get('/', (req, res) => {
    res.send(`
        <h1>DPEaaS Preview Server</h1>
        <p>Mock preview server çalışıyor!</p>
        <p>PR preview'ları /pr-{number} adresinde görülebilir</p>
        <p>Örnek: <a href="/pr-16">/pr-16</a></p>
    `);
});

app.listen(PORT, () => {
    console.log(`🌍 Preview server listening on http://localhost:${PORT}`);
    console.log(`📋 Available preview URLs:`);
    console.log(`   http://localhost:${PORT}/pr-{NUMBER} - PR preview'ları`);
}); 