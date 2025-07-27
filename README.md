# DPEaaS (DevOps Platform as a Service)

DPEaaS is a modern DevOps platform that creates automatic preview environments for GitHub pull requests. It uses Kubernetes, Docker, and Node.js technologies to help developers quickly test their PRs.

## 🚀 Features

- **Automatic Preview Environment**: Automatic Kubernetes deployment for GitHub PRs
- **Multi-Stack Support**: Support for Frontend, Backend and Generic applications
- **Docker Integration**: Automatic Docker image build and push
- **Real-time Testing**: Automatic testing of deployed applications
- **Modern UI**: User-friendly interface built with React.js
- **GitHub Integration**: Full integration with GitHub API

## 📋 Requirements

### System Requirements
- **Node.js**: v18.0.0 or higher
- **Kubernetes**: Minikube v1.28.0 or higher
- **Git**: v2.30.0 or higher
- **PowerShell**: For Windows (Windows 10/11)

## 🛠️ Installation

### 1. Clone the Project
```bash
git clone <repository-url>
cd DPEaaS-
```

### 2. Backend Installation
```bash
cd backend
npm install
```

### 3. Frontend Installation
```bash
cd ../frontend
npm install
```

### 4. Kubernetes Installation (Minikube)
```bash
# Start Minikube
minikube start --driver=docker --memory=8192 --cpus=4

# Check if Kubernetes cluster is ready
kubectl get nodes

# Enable Ingress addon
minikube addons enable ingress
```

## 🏗️ Project Structure

```
DPEaaS-/
├── backend/                          # Backend API (Node.js/Express)
│   ├── app.js                        # Main application file
│   ├── controllers/                  # Controllers
│   │   ├── PreviewController.js      # Preview operations
│   │   └── RepoController.js         # Repository operations
│   ├── routes/                       # API routes
│   │   ├── PreviewRoutes.js          # Preview endpoints
│   │   └── RepoRoutes.js             # Repository endpoints
│   ├── services/                     # Business logic
│   │   ├── KubernetesService.js      # Kubernetes operations
│   │   └── GithubService.js          # GitHub API operations
│   ├── templates/                    # Kubernetes YAML templates
│   │   ├── deployment.yaml           # Generic deployment
│   │   ├── service.yaml              # Service template
│   │   ├── ingress.yaml              # Ingress template
│   │   ├── frontend-deployment.yaml  # Frontend deployment
│   │   ├── frontend-service.yaml     # Frontend service
│   │   ├── backend-deployment.yaml   # Backend deployment
│   │   └── backend-service.yaml      # Backend service
│   ├── repos/                        # Cloned repositories
│   └── package.json                  # Backend dependencies
├── frontend/                         # Frontend (React.js)
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── CreateModal.jsx       # Preview creation modal
│   │   │   └── TestResultCard.jsx    # Test results card
│   │   ├── pages/                    # Page components
│   │   │   ├── ConnectPage.jsx       # Repository connection page
│   │   │   └── PreviewPage.jsx       # Preview management page
│   │   ├── App.jsx                   # Main application component
│   │   └── main.jsx                  # Application entry point
│   ├── public/                       # Static files
│   └── package.json                  # Frontend dependencies
├── docker-compose.yml                # Docker Compose configuration
└── README.md                         # This file
```


### GitHub Token Creation

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token"
3. Grant the following permissions:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
   - `workflow` (Update GitHub Action workflows)

## 🚀 Running

### 1. Start Backend
```bash
cd backend
npm start
```

Backend will run at http://localhost:8080

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run at http://localhost:5173

### 3. Start Minikube
```bash
minikube start
```

## 🔍 Repository Structure Requirements

DPEaaS supports the following repository structures:

### 1. Generic Application
```
repository/
├── package.json
└── src/
```

### 2. Frontend + Backend
```
repository/
├── frontend/
│   ├── package.json
│   └── src/
├── backend/
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

### 3. Nested Structure
```
repository/
├── project-name/
│   ├── frontend/
│   │   └── package.json
│   ├── backend/
│   │   └── package.json
│   └── docker-compose.yml
└── README.md
```


## 📊 Monitoring

### Kubernetes Dashboard
```bash
# Start dashboard
minikube dashboard

# Or check with kubectl
kubectl get pods --all-namespaces
kubectl get services --all-namespaces
kubectl get ingress --all-namespaces
```

### Log Checking
```bash
# Check pod logs
kubectl logs <pod-name> -n <namespace>

# Check service status
kubectl describe service <service-name> -n <namespace>
```


**DPEaaS** - DevOps Platform as a Service 🚀
