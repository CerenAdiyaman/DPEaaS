const KubernetesService = require('../services/KubernetesService');
const githubService = require('../services/GithubService');

// Test mode - git komutlarını atla
const TEST_MODE = process.env.TEST_MODE !== 'false';

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

        // Check if the PR branch is already pulled (skip in test mode)
        if (!TEST_MODE) {
            await githubService.pullPRinBranch(repoDetails.localPath, prNumber);
        } else {
            console.log(`🧪 TEST MODE: Skipping git pull for PR #${prNumber}`);
        }
        
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