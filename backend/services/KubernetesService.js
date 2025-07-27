const fs = require('fs');
const { exec } = require('child_process');  
const util = require('util');
const execAsync = util.promisify(exec);
const path = require('path');
const mustache = require('mustache');
const { executionAsyncResource } = require('async_hooks');

// @brief Function to calculate dynamic port based on PR number
// @param {number} prNumber - Pull request number
// @param {string} type - Type of service ('generic', 'frontend', 'backend')
// @returns {number} - Dynamic port number
function calculateDynamicPort(prNumber, type, namespace) {
    console.log('About to call calculateDynamicPort with params:', { prNumber, type, namespace });
    const basePorts = {
        'generic': 30100,
        'frontend': 30101,
        'backend': 30102
    };
    
    const basePort = basePorts[type] || 30100;
    
    // Namespace'den suffix'i çıkar (örn: pr-1-47 -> 47)
    const namespaceSuffix = namespace.split('-').pop();
    const suffixNumber = parseInt(namespaceSuffix) || 0;
    
    // Her PR için 3 port aralığı + namespace suffix
    const offset = (prNumber % 100) * 3 + suffixNumber;
    
    return basePort + offset;
}

// @brief Function to load a YAML template and replace placeholders with actual data
// @param {string} templateName - Name of the template file
// @param {Object} data - Data to replace in the template
// @returns {string} - The content of the template with placeholders replaced
function loadYamlTemplate(templateName, data) {
    // Check if template file exists
    const templatePath = `./templates/${templateName}`;
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }
    
    // Load the template file
    let content = fs.readFileSync(templatePath, 'utf8')
    console.log('=== LOAD YAML TEMPLATE DEBUG ===');
    console.log('Template file:', templateName);
    console.log('Template content before replacement:', content);
    console.log('Data to replace:', JSON.stringify(data, null, 2));
    
    // Use Mustache to render the template with HTML escaping disabled
    console.log('Using Mustache to render template...');
    const renderedContent = mustache.render(content, data, {}, ['{{', '}}']).replace(/&#x2F;/g, '/');
    
    console.log('=== FINAL RESULT ===');
    console.log('Template content after replacement:', renderedContent);
    console.log('=== END DEBUG ===\n');
    return renderedContent;
}

// @brief Function to check if the repository has a frontend directory
// @param {Object} repoDetails - Details of the repository
// @returns {boolean} - True if frontend directory exists, false otherwise
function hasFrontend(repoDetails) {
    const repoPath = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'));
    console.log('Checking frontend in repo path:', repoPath);
    
    // Direkt frontend klasörü kontrolü
    const directFrontendPath = path.join(repoPath, 'frontend');
    if (fs.existsSync(directFrontendPath)) {
        console.log('Direct frontend path exists:', directFrontendPath);
        return true;
    }
    
    // Alt klasörlerde frontend arama
    try {
        const items = fs.readdirSync(repoPath);
        for (const item of items) {
            const itemPath = path.join(repoPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                const nestedFrontendPath = path.join(itemPath, 'frontend');
                if (fs.existsSync(nestedFrontendPath)) {
                    console.log('Nested frontend path found:', nestedFrontendPath);
                    return true;
                }
            }
        }
    } catch (error) {
        console.log('Error reading directory:', error.message);
    }
    
    console.log('Frontend not found');
    return false;
}

// @brief Function to check if the repository has a backend directory
// @param {Object} repoDetails - Details of the repository
// @returns {boolean} - True if backend directory exists, false otherwise
function hasBackend(repoDetails) {
    const repoPath = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'));
    console.log('Checking backend in repo path:', repoPath);
    
    // Direkt backend klasörü kontrolü
    const directBackendPath = path.join(repoPath, 'backend');
    if (fs.existsSync(directBackendPath)) {
        console.log('Direct backend path exists:', directBackendPath);
        return true;
    }
    
    // Alt klasörlerde backend arama
    try {
        const items = fs.readdirSync(repoPath);
        for (const item of items) {
            const itemPath = path.join(repoPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                const nestedBackendPath = path.join(itemPath, 'backend');
                if (fs.existsSync(nestedBackendPath)) {
                    console.log('Nested backend path found:', nestedBackendPath);
                    return true;
                }
            }
        }
    } catch (error) {
        console.log('Error reading directory:', error.message);
    }
    
    console.log('Backend not found');
    return false;
}

// @brief Function to build and push a Docker image for frontend or backend and control if docker-compose is used, if used it will build the image using docker-compose
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} type - Type of the application ('frontend' or 'backend')
// @returns {Promise} - Promise that resolves when the image is built and pushed
function buildAndPushDockerImage(repoDetails, prNumber, type) {
    const repoPath = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'));
    const folder = type === 'frontend' ? 'frontend' : 'backend';
    
    // Nested docker-compose.yml dosyalarını ara
    let composeContext = null;
    try {
        const items = fs.readdirSync(repoPath);
        for (const item of items) {
            const itemPath = path.join(repoPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                const nestedComposePath = path.join(itemPath, 'docker-compose.yml');
                if (fs.existsSync(nestedComposePath)) {
                    composeContext = itemPath;
                    console.log(`Found docker-compose.yml in nested directory: ${composeContext}`);
                    break;
                }
            }
        }
    } catch (error) {
        console.log('Error searching for nested docker-compose files:', error.message);
    }
    
    // Eğer nested docker-compose.yml bulunduysa, onu kullan
    if (composeContext) {
        const composePath = path.join(composeContext, 'docker-compose.yml');
        const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}-${type}:pr-${prNumber}`;
        const serviceName = type;
        
        console.log(`Using nested docker-compose.yml for ${type} build`);
        
        // Docker-compose ile build et - docker-compose.yml dosyası zaten doğru context'i belirliyor
        return execAsync(`docker-compose -f ${composePath} build ${serviceName}`, { cwd: composeContext })
            .then(() => {
                console.log(`Tagging ${serviceName} as ${image}`);
                return execAsync(`docker tag ${serviceName} ${image}`);
            })
            .then(() => {
                console.log(`Pushing ${image}`);
                return execAsync(`docker push ${image}`);
            })
            .then(() => {
                console.log(`Nested docker-compose ${type} image built and pushed successfully: ${image}`);
            })
            .catch((error) => {
                console.error(`Error in nested docker-compose build/push for ${type}:`, error);
                throw error;
            });
    }
    
    // Direkt klasör kontrolü
    let context = path.join(repoPath, folder);
    
    // Eğer direkt klasör yoksa, nested klasörlerde ara
    if (!fs.existsSync(context)) {
        try {
            const items = fs.readdirSync(repoPath);
            for (const item of items) {
                const itemPath = path.join(repoPath, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    const nestedPath = path.join(itemPath, folder);
                    if (fs.existsSync(nestedPath)) {
                        // Eğer Dockerfile backend/ klasörünü arıyorsa, context'i bir üst seviyeye çıkar
                        const dockerfilePath = path.join(nestedPath, 'Dockerfile');
                        if (fs.existsSync(dockerfilePath)) {
                            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                            if (dockerfileContent.includes('COPY backend/')) {
                                context = itemPath; // Bir üst seviye
                                console.log(`Found ${type} in nested directory with backend/ reference, using parent context:`, context);
                            } else {
                                context = nestedPath;
                                console.log(`Found ${type} in nested directory:`, context);
                            }
                        } else {
                            context = nestedPath;
                            console.log(`Found ${type} in nested directory:`, context);
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            console.log('Error searching for nested directories:', error.message);
        }
    }
    
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}-${type}:pr-${prNumber}`;
    const composePath = path.join(context, 'docker-compose.yml');

    console.log(`Building and pushing Docker image for ${type}:`, image);
    console.log(`Build context:`, context);

    if (fs.existsSync(composePath)) {
        console.log(`docker-compose.yml detected for ${type}, using docker-compose to build.`);
        const serviceName = type; 
        const tagCmd = `docker tag ${serviceName} ${image}`;
        return execAsync(`docker-compose -f ${composePath} build ${serviceName} && ${tagCmd} && docker push ${image}`, execAsync('docker images load -i ${image}'), {
            cwd: context,
        });
    } else {
        console.log(`Building Docker image: ${image}`);
        return execAsync(`docker build --platform linux/amd64 -t ${image} ${context}`)
            .then(() => {
                console.log(`Docker image built successfully: ${image}`);
                console.log(`Pushing Docker image: ${image}`);
                return execAsync(`docker push ${image}`);
            })
            .then(() => {
                console.log(`Docker image pushed successfully: ${image}`);
            })
            .catch((error) => {
                console.error(`Error in Docker build/push for ${type}:`, error);
                throw error;
            });
    }
}


// @brief Function to build and push a generic Docker image
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @returns {Promise} - Promise that resolves when the image is built and pushed
async function buildAndPushGenericImage(repoDetails, prNumber) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}:pr-${prNumber}`;
    const context = path.join(__dirname, '..', 'repos', repoDetails.repository.replace('/', '-'));
    console.log(`Building generic Docker image:`, image);
    await execAsync(`docker build --platform linux/amd64 -t ${image} ${context}`);
    console.log(`Docker image built:`, image);
    await execAsync(`docker push ${image}`);
    console.log(`Generic Docker image built and pushed:`, image);
}

// @brief Function to deploy frontend, backend, or generic application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the application is deployed
async function deployFrontend(namespace, hostname, repoDetails, prNumber, appName) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}-frontend:pr-${prNumber}`;

    console.log('=== DEPLOY FRONTEND DEBUG ===');
    console.log('Parameters passed to loadYamlTemplate:');
    console.log('- namespace:', namespace);
    console.log('- appName:', appName);
    console.log('- image:', image);
    console.log('==============================');
    
    const deploymentYaml = loadYamlTemplate('frontend-deployment.yaml', { namespace: namespace, frontend_image: image, app_name: appName });
    const deploymentPath = `frontend-deployment-pr-${prNumber}.yaml`;
    fs.writeFileSync(deploymentPath, deploymentYaml);
    console.log("YAML file for deployment created:", deploymentPath);

    const dynamicPort = calculateDynamicPort(prNumber, 'frontend', namespace);
    const serviceYaml = loadYamlTemplate('frontend-service.yaml', { 
        namespace: namespace, 
        service_name: `${appName}-frontend`, 
        app_name: appName,
        nodePort: dynamicPort
    });
    const servicePath = `frontend-service-pr-${prNumber}.yaml`;
    fs.writeFileSync(servicePath, serviceYaml);
    console.log("YAML file for service created:", servicePath);


    const ingressYaml = loadYamlTemplate('ingress-frontend.yaml', { namespace: namespace, hostname: hostname, service_name: `${appName}-frontend`, prNumber: prNumber });
    const ingressPath = `frontend-ingress-pr-${prNumber}.yaml`;
    fs.writeFileSync(ingressPath, ingressYaml);
    console.log("YAML file for ingress created:", ingressPath);

    await execAsync(`kubectl apply -f ${deploymentPath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${servicePath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${ingressPath} --namespace=${namespace}`);
    
    // Wait for deployment to be ready
    console.log(`Waiting for frontend deployment to be ready...`);
    try {
        await execAsync(`kubectl wait --for=condition=available --timeout=300s deployment/${appName}-frontend -n ${namespace}`);
        console.log(`Frontend deployment is ready!`);
    } catch (error) {
        console.warn(`Warning: Frontend deployment wait timeout or error:`, error.message);
    }
    
    //fs.unlinkSync(deploymentPath);
    //fs.unlinkSync(servicePath);
    //fs.unlinkSync(ingressPath);
    console.log("Frontend deployed successfully for PR:", prNumber);
}

// @brief Function to deploy backend application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the backend application is deployed
async function deployBackend(namespace, hostname, repoDetails, prNumber, appName) {
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}-backend:pr-${prNumber}`;

    console.log('=== DEPLOY BACKEND DEBUG ===');
    console.log('Parameters passed to loadYamlTemplate:');
    console.log('- namespace:', namespace);
    console.log('- appName:', appName);
    console.log('- image:', image);
    console.log('==============================');
    
    const deploymentYaml = loadYamlTemplate('backend-deployment.yaml', { namespace: namespace, backend_image: image, app_name: appName });
    const deploymentPath = `backend-deployment-pr-${prNumber}.yaml`;
    fs.writeFileSync(deploymentPath, deploymentYaml);
    console.log("YAML file for backend deployment created:", deploymentPath);

    const dynamicPort = calculateDynamicPort(prNumber, 'backend', namespace);
    const serviceYaml = loadYamlTemplate('backend-service.yaml', { 
        namespace: namespace, 
        service_name: `${appName}-backend`, 
        app_name: appName,
        nodePort: dynamicPort
    });
    const servicePath = `backend-service-pr-${prNumber}.yaml`;
    fs.writeFileSync(servicePath, serviceYaml);
    console.log("YAML file for backend service created:", servicePath);

    const ingressYaml = loadYamlTemplate('ingress-backend.yaml', { namespace: namespace, hostname: hostname, service_name: `${appName}-backend`, prNumber: prNumber });
    const ingressPath = `backend-ingress-pr-${prNumber}.yaml`;
    fs.writeFileSync(ingressPath, ingressYaml);
    console.log("YAML file for backend ingress created:", ingressPath);

    await execAsync(`kubectl apply -f ${deploymentPath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${servicePath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${ingressPath} --namespace=${namespace}`);
    
    // Wait for deployment to be ready
    console.log(`Waiting for backend deployment to be ready...`);
    try {
        await execAsync(`kubectl wait --for=condition=available --timeout=300s deployment/${appName}-backend -n ${namespace}`);
        console.log(`Backend deployment is ready!`);
    } catch (error) {
        console.warn(`Warning: Backend deployment wait timeout or error:`, error.message);
    }
    
    fs.unlinkSync(deploymentPath);
    fs.unlinkSync(servicePath);
    fs.unlinkSync(ingressPath);
    console.log("Backend deployed successfully for PR:", prNumber);
}

// @brief Function to deploy a generic application to Kubernetes
// @param {string} namespace - Kubernetes namespace to deploy to
// @param {string} hostname - Hostname for the application
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @param {string} appName - Name of the application
// @returns {Promise} - Promise that resolves when the generic application is deployed
async function deployGeneric(namespace, hostname, repoDetails, prNumber, appName) {
    console.log("deployGeneric called with:", { namespace, hostname, prNumber, appName });
    
    // Check if namespace is valid
    if (!namespace || namespace === 'undefined' || namespace === 'null') {
        throw new Error(`Invalid namespace: ${namespace}`);
    }
    
    const image = `cerenadiyaman/${repoDetails.repository.replace('/', '-').toLowerCase()}:pr-${prNumber}`;

    console.log('=== DEPLOY GENERIC DEBUG ===');
    console.log('Parameters passed to loadYamlTemplate:');
    console.log('- namespace:', namespace);
    console.log('- appName:', appName);
    console.log('- image:', image);
    console.log('==============================');
    
    const deploymentYaml = loadYamlTemplate('deployment.yaml', { namespace: namespace, app_name: appName, image: image });
    console.log('YAML template params:', { namespace: namespace, appName: appName, image: image });
    const deploymentPath = `deployment-pr-${prNumber}.yaml`;
    fs.writeFileSync(deploymentPath, deploymentYaml);
    console.log("YAML file for deployment created:", deploymentPath);

    console.log('About to calculate dynamic port...');
    console.log('prNumber type:', typeof prNumber);
    console.log('prNumber value:', prNumber);
    console.log('About to call calculateDynamicPort...');
    console.log('About to call calculateDynamicPort with params:', { prNumber, type: 'generic', namespace });
    const dynamicPort = calculateDynamicPort(prNumber, 'generic', namespace);
    console.log('Dynamic port for generic service:', dynamicPort);
    console.log('About to create serviceData...');
    const serviceData = { 
        namespace: namespace, 
        app_name: appName, 
        service_name: `${appName}-service`,
        nodePort: dynamicPort
    };
    console.log('Service template data:', serviceData);
    console.log('About to load service template...');
    const serviceYaml = loadYamlTemplate('service.yaml', serviceData);
    const servicePath = `service-pr-${prNumber}.yaml`;
    fs.writeFileSync(servicePath, serviceYaml);
    console.log("YAML file for service created:", servicePath);

    const ingressYaml = loadYamlTemplate('ingress.yaml', { namespace: namespace, app_name: appName, hostname: hostname, service_name: `${appName}-service`, prNumber: prNumber });
    const ingressPath = `ingress-pr-${prNumber}.yaml`;
    fs.writeFileSync(ingressPath, ingressYaml);
    console.log("YAML file for ingress created:", ingressPath);

    await execAsync(`kubectl apply -f ${deploymentPath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${servicePath} --namespace=${namespace}`);
    await execAsync(`kubectl apply -f ${ingressPath} --namespace=${namespace}`);
    
    // Wait for deployment to be ready
    console.log(`Waiting for generic deployment to be ready...`);
    try {
        await execAsync(`kubectl wait --for=condition=available --timeout=300s deployment/${appName} -n ${namespace}`);
        console.log(`Generic deployment is ready!`);
    } catch (error) {
        console.warn(`Warning: Generic deployment wait timeout or error:`, error.message);
    }
    
    //fs.unlinkSync(deploymentPath);
    //fs.unlinkSync(servicePath);
    //fs.unlinkSync(ingressPath);
    console.log("Generic application deployed successfully for PR:", prNumber);
    
}

// @brief Function to create a preview environment for a pull request
// @param {Object} repoDetails - Details of the repository
// @param {number} prNumber - Pull request number
// @returns {Promise} - Promise that resolves when the preview environment is created
exports.createPreview = async (repoDetails, prNumber) => {
    let namespace = `pr-${prNumber}`;
    let suffix = 1;
    let created = false;

    while (!created) {
        try {
            await execAsync(`kubectl create namespace ${namespace}`);
            console.log(`Namespace ${namespace} created successfully`);
            created = true;
        } catch (err) {
            if (err.stderr && err.stderr.includes('AlreadyExists')) {
                // Namespace already exists, try a new name with a suffix
                namespace = `pr-${prNumber}-${suffix}`;
                suffix++;
            } else {
                throw err;
            }
        }
    }

    const appName = repoDetails.repository.split('/')[1].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const hostname = `pr-${prNumber}.dpeaas.local`;

    console.log("Final namespace:", namespace);
    console.log("Final appName:", appName);
    console.log("Final hostname:", hostname);

    try{
        console.log("Creating YAML file for deployment for PR:", prNumber);
        console.log("Checking if repository has frontend/backend...");
        const hasFrontendResult = hasFrontend(repoDetails);
        const hasBackendResult = hasBackend(repoDetails);
        console.log("Has frontend:", hasFrontendResult);
        console.log("Has backend:", hasBackendResult);
        
        if(hasFrontendResult) {
            await buildAndPushDockerImage(repoDetails, prNumber, 'frontend');
            console.log("*Frontend Docker image built and pushed for PR:", prNumber);
            await deployFrontend(namespace, hostname, repoDetails, prNumber, appName);
            console.log("*Frontend deployed successfully for PR:", prNumber);
        } else if(hasBackendResult) {
            await buildAndPushDockerImage(repoDetails, prNumber, 'backend');
            console.log("*Backend Docker image built and pushed for PR:", prNumber);
            await deployBackend(namespace, hostname, repoDetails, prNumber, appName);
            console.log("*Backend deployed successfully for PR:", prNumber);
        } else {
            await buildAndPushGenericImage(repoDetails, prNumber);
            console.log("*Generic Docker image built and pushed for PR:", prNumber);
            console.log("Calling deployGeneric with params:", { namespace, hostname, prNumber, appName });
            await deployGeneric(namespace, hostname, repoDetails, prNumber, appName);
            console.log("*Generic application deployed successfully for PR:", prNumber);
        }

        // Generate service URL based on deployment type
        let serviceName;
        if(hasFrontendResult) {
            serviceName = `${appName}-frontend`;
        } else if(hasBackendResult) {
            serviceName = `${appName}-backend`;
        } else {
            serviceName = `${appName}-service`;
        }

        // Open service in browser for generic deployments
        if (!hasFrontendResult && !hasBackendResult) {
            await execAsync(`minikube service ${serviceName} -n ${namespace}`);
            console.log("open on web");
            await execAsync(`kubectl port-forward service/${serviceName} 8080:80 -n ${namespace}`);
        }

        // Get the actual service URL
        let actualUrl;
        try {
            const stdout  = await execAsync(`minikube service ${serviceName} -n ${namespace}`);
            actualUrl = stdout.trim();
        } catch (error) {
            console.warn('Could not get service URL:', error.message);
        }

        return{
            status: 'success',
            message: `Preview created for PR ${prNumber}`,
            url: actualUrl,
            serviceUrl: actualUrl,
            resources: {
                namespace,
                deployment: `deployment-${prNumber}`,
                service: serviceName
            }
        };
    }catch (error) {
        console.error("Error:", error.stderr || error.message);
        throw new Error("Failed to create preview environment");
    }
}

exports.deployGeneric = deployGeneric;

exports.deletePreview = async (prNumber) => {
    try {
        console.log("Deleting Kubernetes resources for PR:", prNumber);
        
        // Tüm namespace'leri bul (pr-{prNumber} ile başlayan)
        const { stdout: namespaces } = await execAsync(`kubectl get namespaces -o jsonpath='{.items[?(@.metadata.name.startsWith("pr-${prNumber}"))].metadata.name}'`);
        
        if (namespaces.trim()) {
            const namespaceList = namespaces.trim().split(' ');
            console.log(`Found namespaces to delete: ${namespaceList.join(', ')}`);
            
            // Her namespace'i sil
            for (const namespace of namespaceList) {
                try {
                    await execAsync(`kubectl delete namespace ${namespace}`);
                    console.log(`Namespace ${namespace} deleted successfully`);
                } catch (namespaceError) {
                    console.warn(`Failed to delete namespace ${namespace}:`, namespaceError.message);
                }
            }
        } else {
            console.log(`No namespaces found for PR ${prNumber}`);
        }

        // Docker image'larını da sil
        try {
            await execAsync(`docker rmi cerenadiyaman/*:pr-${prNumber} --force`);
            console.log(`Docker images for PR ${prNumber} deleted successfully`);
        } catch (dockerError) {
            console.warn(`Failed to delete Docker images:`, dockerError.message);
        }

        return{
            status: 'success',
            message: `Preview deleted for PR ${prNumber}`,
            resources: {  
                namespaces: namespaces.trim() ? namespaces.trim().split(' ') : [],
                dockerImages: `cerenadiyaman/*:pr-${prNumber}`
            }
        };

    } catch (error) {
        console.error('Error deleting Kubernetes resources:', error);
        throw new Error('Failed to delete Kubernetes resources');
    }
}