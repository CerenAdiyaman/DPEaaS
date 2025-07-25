const KubernetesService = require('./services/KubernetesService');

// Test data
const repoDetails = {
    repository: 'CerenAdiyaman/DPEaaS-Test'
};

const namespace = 'pr-1-test';
const hostname = 'pr-1.dpeaas.local';
const prNumber = 1;
const appName = 'dpeaas-test';

// Test the deployGeneric function
async function testDeployGeneric() {
    try {
        console.log('Testing deployGeneric function...');
        console.log('Parameters:', { namespace, hostname, prNumber, appName });
        
        await KubernetesService.deployGeneric(namespace, hostname, repoDetails, prNumber, appName);
        console.log('Success: deployGeneric completed');
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDeployGeneric(); 