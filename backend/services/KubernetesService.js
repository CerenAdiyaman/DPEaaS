const axios = require('axios');

exports.createPreview = async (repoDetails, prNumber) => {
    try {
        console.log("Creating Kubernetes resources for PR:", prNumber);
        
        // Simulate Kubernetes resource creation
        const k8sResponse = {
            status: 'success',
            message: `Preview created for PR ${prNumber} in repo ${repoDetails.repository}`,
            resources: {
                deployment: `deployment-${prNumber}`,
                service: `service-${prNumber}`
            }
        };
        
        console.log("Kubernetes resources created:", k8sResponse);
        return k8sResponse;
    } catch (error) {
        console.error('Error creating Kubernetes resources:', error);
        throw new Error('Failed to create Kubernetes resources');
    }
}


exports.deletePreview = async (prNumber) => {
    try {
        console.log("Deleting Kubernetes resources for PR:", prNumber);
        
        // Simulate Kubernetes resource deletion
        const k8sResponse = {
            status: 'success',
            message: `Preview deleted for PR ${prNumber}`,
            resources: {
                deployment: `deployment-${prNumber}`,
                service: `service-${prNumber}`
            }
        };
        
        console.log("Kubernetes resources deleted:", k8sResponse);
        return k8sResponse;
    } catch (error) {
        console.error('Error deleting Kubernetes resources:', error);
        throw new Error('Failed to delete Kubernetes resources');
    }
}