
const fs = require('fs');
const { exec } = require('child_process');  
const util = require('util');
const execAsync = util.promisify(exec);
const path = require('path');

function loadYamlTemplate(templateName, data) {
    // Load the template file
    let content = fs.readFileSync(`./templates/${templateName}`, 'utf8')
    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp('{{${key}}}', 'g');
        content = content.replace(regex, value);
    });
    return content;
}

exports.createPreview = async (repoDetails, prNumber) => {
    const namespace = `pr-${prNumber}`; 
    const image = `cerenadiyaman/${repoDetails.repository}:pr-${prNumber}`;


    try{
        console.log(" Building and pushing docker image for PR:", prNumber);
        await execAsync(`docker build -t ${image} .`);
        await execAsync(`docker push ${image}`);

        console.log("Creating namespace:", namespace);
        await execAsync(`kubectl create namespace ${namespace}`);

        console.log("Creating YAML file for deployment for PR:", prNumber);
        if(hasFrontend) {
            const frontendDeploymentYaml = loadYamlTemplate('frontend-deployment.yaml', {
                namespace, frontend_image});
            await execAsync(`echo "${frontendDeploymentYaml}" > frontend-deployment.yaml`);
        }

        if(hasBackend) {
            const backendDeploymentYaml = loadYamlTemplate('backend-deployment.yaml', {
                namespace, backend_image});
            await execAsync(`echo "${backendDeploymentYaml}" > backend-deployment.yaml`);
        }

        await execAsync('minikube start --driver=docker');
        
        console.log("Applying deployment YAML to Kubernetes");
        await execAsync(`kubectl apply -f ${deploymentYaml} --namespace=${namespace}`);

        return{
            status: 'success',
            message: `Preview created for PR ${prNumber}`,
            resources: {
                namespace,
                deployment: `deployment-${prNumber}`,
                service: `service-${prNumber}`
            }
        };
    }catch (error) {
        console.error("Error:", error.stderr || error.message);
        throw new Error("Failed to create preview environment");
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