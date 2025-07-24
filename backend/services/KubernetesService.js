
const fs = require('fs');
const { exec } = require('child_process');  
const util = require('util');
const execAsync = util.promisify(exec);
const path = require('path');

// @brief Function to load a YAML template and replace placeholders with actual data
// @param {string} templateName - Name of the template file
// @param {Object} data - Data to replace in the template
// @returns {string} - The content of the template with placeholders replaced
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

// @brief Function to check if the repository has a frontend directory
// @param {Object} repoDetails - Details of the repository
// @returns {boolean} - True if frontend directory exists, false otherwise
function hasFrontend(repoDetails) {
    const frontendPath = path.join(__dirname, '..', 'repos', repoDetails.repository, 'frontend');
    return fs.existsSync(frontendPath);
}

// @brief Function to check if the repository has a backend directory
// @param {Object} repoDetails - Details of the repository
// @returns {boolean} - True if backend directory exists, false otherwise
function hasBackend(repoDetails) {
    const backendPath = path.join(__dirname, '..', 'repos', repoDetails.repository,
        'backend');
    return fs.existsSync(backendPath);
}

// @brief Function to build and push a Docker image for frontend or backend and control if docker-compose is used, if used it will build the image using docker-compose
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} type - Type of the application ('frontend' or 'backend')
// @returns {Promise} - Promise that resolves when the image is built and pushed
function buildAndPushDockerImage(repoDetails, prNumber, type) {
    const folder = type === 'frontend' ? 'frontend' : 'backend';
    const context = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'), folder);
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-')}-${type}:pr-${prNumber}`;

    const composePath = path.join(context, 'docker-compose.yml');

    console.log(`Building and pushing Docker image for ${type}:`, image);

    if (fs.existsSync(composePath)) {
        console.log(`docker-compose.yml detected for ${type}, using docker-compose to build.`);
        const serviceName = type; // varsayılan olarak 'frontend' veya 'backend'
        const tagCmd = `docker tag ${serviceName} ${image}`;
        return execAsync(`docker-compose -f ${composePath} build ${serviceName} && ${tagCmd} && docker push ${image}`, {
            cwd: context,
        });
    } else {
        return execAsync(`docker build -t ${image} ${context} && docker push ${image}`);
    }
}


// @brief Function to build and push a generic Docker image
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @returns {Promise} - Promise that resolves when the image is built and pushed
function buildAndPushGenericImage(repoDetails, prNumber) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-')}:pr-${prNumber}`;
    const context = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'));
    console.log(`Building and pushing generic Docker image:`, image);
    return execAsync(`docker build -t ${image} ${context} && docker push ${image}`);
}

// @brief Function to deploy frontend, backend, or generic application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the application is deployed
async function deployFrontend(namespace, hostname, repoDetails, prNumber, appName) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-')}-frontend:pr-${prNumber}`;

    const deploymentYaml = loadYamlTemplate('frontend-deployment.yaml', { namespace, frontend_image: image });
    fs.writeFileSync('frontend-deployment.yaml', deploymentYaml);

    const serviceYaml = loadYamlTemplate('frontend-service.yaml', { namespace, service_name: `${appName}-frontend` });
    fs.writeFileSync('frontend-service.yaml', serviceYaml);

    const ingressYaml = loadYamlTemplate('frontend-ingress.yaml', { namespace, hostname, service_name: `${appName}-frontend` });
    fs.writeFileSync('frontend-ingress.yaml', ingressYaml);

    await execAsync(`kubectl apply -f frontend-deployment.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f frontend-service.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f frontend-ingress.yaml --namespace=${namespace}`);
}

// @brief Function to deploy backend application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the backend application is deployed
async function deployBackend(namespace, hostname, repoDetails, prNumber, appName) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-')}-backend:pr-${prNumber}`;

    const deploymentYaml = loadYamlTemplate('backend-deployment.yaml', { namespace, backend_image: image });
    fs.writeFileSync('backend-deployment.yaml', deploymentYaml);

    const serviceYaml = loadYamlTemplate('backend-service.yaml', { namespace, service_name: `${appName}-backend` });
    fs.writeFileSync('backend-service.yaml', serviceYaml);

    const ingressYaml = loadYamlTemplate('backend-ingress.yaml', { namespace, hostname, service_name: `${appName}-backend` });
    fs.writeFileSync('backend-ingress.yaml', ingressYaml);

    await execAsync(`kubectl apply -f backend-deployment.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f backend-service.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f backend-ingress.yaml --namespace=${namespace}`);
}

// @brief Function to deploy a generic application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the generic application is deployed
async function deployGeneric(namespace, hostname, repoDetails, prNumber, appName) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-')}:pr-${prNumber}`;

    const deploymentYaml = loadYamlTemplate('deployment.yaml', { namespace, app_name: appName, image });
    fs.writeFileSync('deployment.yaml', deploymentYaml);

    const serviceYaml = loadYamlTemplate('service.yaml', { namespace, app_name: appName, service_name: `${appName}-service` });
    fs.writeFileSync('service.yaml', serviceYaml);

    const ingressYaml = loadYamlTemplate('ingress.yaml', { namespace, app_name: appName, hostname, service_name: `${appName}-service` });
    fs.writeFileSync('ingress.yaml', ingressYaml);

    await execAsync(`kubectl apply -f deployment.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f service.yaml --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ingress.yaml --namespace=${namespace}`);
}

// @brief Function to create a preview environment for a pull request
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @returns {Promise} - Promise that resolves when the preview environment is created
exports.createPreview = async (repoDetails, prNumber) => {
    const namespace = `pr-${prNumber}`; 
    const appName = repoDetails.repository.split('/')[1].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const hostname = `pr-${prNumber}.dpeaas.local`;

    try{
        console.log("Creating Kubernetes namespace for PR:", prNumber);
        await execAsync(`kubectl create namespace ${namespace}`);
        console.log(`Namespace ${namespace} created successfully`);

        console.log("Creating YAML file for deployment for PR:", prNumber);
        if(hasFrontend(repoDetails)) {

            await buildAndPushDockerImage(repoDetails, prNumber, 'frontend');
            await deployFrontend(namespace, hostname, repoDetails, prNumber, appName);
            console.log("Frontend deployed successfully for PR:", prNumber);
        }

        if(hasBackend(repoDetails)) {

            await buildAndPushDockerImage(repoDetails, prNumber, 'backend');
            await deployBackend(namespace, hostname, repoDetails, prNumber, appName);
            console.log("Backend deployed successfully for PR:", prNumber);
        }

        if (!hasFrontend(repoDetails) && !hasBackend(repoDetails)) {
            await buildAndPushGenericImage(repoDetails, prNumber);
            await deployGeneric(namespace, hostname, repoDetails, prNumber, appName);
            console.log("Generic application deployed successfully for PR:", prNumber);
        }

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
        await execAsync(`kubectl delete namespace pr-${prNumber}`);
        console.log(`Namespace pr-${prNumber} deleted successfully`);

        return{
            status: 'success',
            message: `Preview deleted for PR ${prNumber}`,
            resources: {  
                namespace: `pr-${prNumber}`,
                deployment: `deployment-${prNumber}`,
                service: `service-${prNumber}`
            }
        };

    } catch (error) {
        console.error('Error deleting Kubernetes resources:', error);
        throw new Error('Failed to delete Kubernetes resources');
    }
}