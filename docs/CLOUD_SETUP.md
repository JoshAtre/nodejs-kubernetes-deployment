# Cloud Setup for Node.js Application Deployment to Kubernetes

This document outlines the steps to deploy the Node.js multi-service application to Google Kubernetes Engine (GKE). The full deployment requires a GKE cluster and Google Artifact Registry (GAR) setup, as the live instance is tied to a private GCP account.

## Prerequisites
- Google Cloud Platform (GCP) account
- Google Cloud SDK (`gcloud`) installed
- Docker installed
- `kubectl` configured
- GitHub Actions setup (optional, for CI/CD)

## Steps

1. **Set Up GCP Project**
- Create a GCP project and enable the following APIs:
  - Kubernetes Engine API
  - Artifact Registry API
- Authenticate locally:
  ```bash
  gcloud auth application-default login
  ```

2. **Create a GKE Cluster**
- Use the GCP Console or `gcloud` to create a cluster. Example:
  ```bash
  gcloud container clusters create cluster1 \
  --region us-west2-b \
  --num-nodes 2 \
  --machine-type e2-small \
  --project <your-project-id>
  ```

- Configure `kubectl` to connect to the cluster:
  ```bash
  gcloud container clusters get-credentials cluster1 --region us-west2-b --project <your-project-id>
  ```

3. **Set Up Google Artifact Registry (GAR)**

- Create a repository in GAR:
  ```bash
  gcloud artifacts repositories create my-repository \
  --repository-format=docker \
  --location=us-west2 \
  --project <your-project-id>
  ```

- Authenticate Docker with GAR:
  ```bash
  gcloud auth configure-docker us-west2-docker.pkg.dev
  ```

4. **Build and Push Docker Images** <br />

For each service (`auth`, `hello`, `backend`):

- Build the Docker image:
  ```bash
  cd <service-name>
  docker build -t us-west2-docker.pkg.dev/<your-project-id>/my-repository/<service-name>:latest .
  ```

- Push to GAR:
  ```bash
  docker push us-west2-docker.pkg.dev/<your-project-id>/my-repository/<service-name>:latest
  ```

5. **Deploy to GKE**

- Apply Kubernetes manifests for each service:
  ```bash
  cd <service-name>/k8s
  kubectl apply -f deployment.yaml
  kubectl apply -f service.yaml
  ```

- Verify pods are running:
  ```bash
  kubectl get pods
  ```

6. **Expose Services with Ingress**

- Apply the Ingress configuration to expose `auth` and `hello`:
  ```bash
  kubectl apply -f k8s/ingress.yaml
  ```

- Get the external IP of the Ingress:
  ```bash
  kubectl get ingress my-ingress
  ```

- Test the deployment:
  ```bash
  token=$(curl -X POST -H "Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=" http://<external-ip>/login | jq -r '.token')
  curl -H "Authorization: Bearer $token" http://<external-ip>/secure
  ```

7. **Optional: CI/CD with GitHub Actions**

- The repository includes a GitHub Actions workflow (`.github/workflows/`) that automates Docker builds, pushes to GAR, and deployments to GKE.
- Configure Workload Identity Federation in GCP:
	* Create a service account with `roles/container.admin`.
	* Set up a Workload Identity Pool and link it to your GitHub repository.
- Update the workflow with your GCP project details and secrets.

## Notes
- Replace `<your-project-id>` with your GCP project ID.
- Ensure your GKE cluster has sufficient resources (e.g., 2 nodes with `e2-small` machine type).


