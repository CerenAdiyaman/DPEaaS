const KubernetesService = require('../services/KubernetesService');
const githubService = require('../services/GithubService');

exports.createPreview = async (req, res) => {
    try {
        const { repoUrl, token, prNumber } = req.body;
        console.log("Creating preview for PR:", prNumber);
    
        // Fetch repository details
        const repoDetails = await githubService.connectAndFetch(repoUrl, token);

        if (!repoDetails.localPath) {
            return res.status(400).json({ error: 'Repository path not found' });    
        }
        console.log("Repository details:", repoDetails);
        // Check if the PR number is provided
        if (!prNumber) {
            return res.status(400).json({ error: 'Pull request number is required' });
        }

        // Check if the PR branch is already pulled
        await githubService.pullPRinBranch(repoDetails.localPath, prNumber);
        
        // Create Kubernetes resources
        const k8sResponse = await KubernetesService.createPreview(repoDetails, prNumber);
        
        res.json(k8sResponse);
    } catch (error) {
        console.error('Error creating preview:', error);
        res.status(500).json({ error: 'Failed to create preview' });
    }
    }

exports.deletePreview = async (req, res) => {
    try {
        const { prNumber } = req.body;
        console.log("Deleting preview for PR:", prNumber);
        
        // Delete Kubernetes resources
        const k8sResponse = await KubernetesService.deletePreview(prNumber);
        
        res.json(k8sResponse);
    } catch (error) {
        console.error('Error deleting preview:', error);
        res.status(500).json({ error: 'Failed to delete preview' });
    }
}