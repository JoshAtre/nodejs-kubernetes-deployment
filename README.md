# Node.js Application Deployment to Kubernetes

![Node.js](https://img.shields.io/badge/Node.js-18-blue)
![GKE](https://img.shields.io/badge/GKE-Kubernetes-green)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Containerized-orange)

A multi-service Node.js application deployed to Google Kubernetes Engine (GKE) with secure JWT-based authentication. This project demonstrates microservices communication, Docker containerization, and a full CI/CD pipeline using GitHub Actions and Google Cloud's Workload Identity Federation.

## Features
- **Multi-Service Architecture**: Three services (`auth`, `hello`, `backend`) with secure communication.
- **JWT Authentication**: Issues, validates, and decodes tokens for secure access.
- **Kubernetes Deployment**: Deployed to GKE using Docker and Kubernetes manifests.
- **CI/CD Pipeline**: Automated builds, deployments, and releases via GitHub Actions and Google Cloud Deploy.
- **Secure Access**: Uses Workload Identity Federation for authentication to Google Cloud resources.

## Prerequisites
- Node.js 18
- Docker
- `curl` and `jq` (for local testing)
- (Optional) Google Cloud SDK (`gcloud`) and `kubectl` for full Kubernetes setup

## Local Setup
The live deployment is tied to a private GCP account, but you can run and test the services locally.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/JoshAtre/nodejs-kubernetes-deployment.git
   cd nodejs-kubernetes-deployment
   ```
   
2. **Install Dependencies** for each service (`auth`, `hello`, `backend`)
   ```bash
   cd <service-name>
   npm install
   cd ..
   ```
   
3. **Run the services** <br />
   Open separate terminals for each service and start them:
   ```bash
   cd auth && node index.js
   cd hello && node index.js
   cd backend && node index.js
   ```

4. **Test the Application** <br />
   In a new terminal, obtain a JWT token and test the secure endpoint:
   ```bash
   token=$(curl -X POST -H "Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=" localhost:3000/login | jq -r '.token')
   curl -v -H "Authorization: Bearer $token" localhost:8080/secure
   ```

## Expected Flow:
- `auth` issues a JWT token.
- `hello` validates the token and forwards the request to `backend`.
- `backend` responds, and the response is relayed back to the client.

## Docker Setup (Optional)
To test with Docker locally:
1. Build and run each service:
   ```bash
   cd <service-name>
   docker build -t <service-name> .
   docker run -p <host-port>:<container-port> <service-name>
   ```
- `auth`: `-p 3000:3000`
- `hello`: `-p 8080:8080`
- `backend`: `-p 9000:9000`

2. Test as above using the exposed ports.

## Notes
1. Note that the full deployment to GKE requires a GKE cluster and Google Artifact Registry setup. See [docs/CLOUD_SETUP.md](docs/CLOUD_SETUP.md) for detailed instructions.
2. Configuration files (`development.yaml` and `production.yaml`) manage service communication settings.
