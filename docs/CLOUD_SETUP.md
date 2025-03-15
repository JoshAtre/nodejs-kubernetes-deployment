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

## Steps I took to set up the CI/CD with GitHub Actions
The repository includes a GitHub Actions workflow (`.github/workflows/`) that automates Docker builds, pushes to Google Artifact Registry (GAR), and deployments to GKE using Google Cloud Deploy. Below are the steps I used to configure the pipeline:
Workflow overview:
  * Trigger: The pipeline runs on pushes to the `main` branch.
  * Tools: Uses Workload Identity Federation for authentication, Google Cloud SDK for interacting with GCP, and Google Cloud Deploy for managing releases.
1. Configured Workload Identity Federation in GCP:
   1. Created a service account
      * Name: `github-cloud-deploy-sa@service-project-dev-1a.iam.gserviceaccount.com`.
      * Assigned the role `roles/clouddeploy.admin` (for Cloud Deploy) and `roles/container.admin` (for GKE access). To update roles:
        * Went to **IAM & Admin > IAM** in the GCP Console.
        * Found the service account, clicked the pencil icon, and modified roles as needed (see [How to Update Roles of Existing Service Accounts](https://stackoverflow.com/questions/61847382/how-to-update-roles-of-existing-service-accounts-google-cloud-console)).
   2. Set Up Workload Identity Pool
      * Pool: `github-actions-cloud-run`
      * Provider: `github`
      * Full Provider Path: `projects/89346032191/locations/global/workloadIdentityPools/github-actions-cloud-run/providers/github`
      * Linked to my GitHub Repository: Mapped the pool to `JoshAtre/simple-node-server` with the attribute `repo:JoshAtre/simple-node-server:ref:refs/heads/main`.
   3. Granted Access to the GitHub Actions workflow to authenticate as the service account using Workload Identity Federation
      * Bound the service account to the Workload Identity Pool provider using the principal `principal://iam.googleapis.com/projects/89346032191/locations/global/workloadIdentityPools/github-actions-cloud-run/subject/repo:JoshAtre/simple-node-server:ref:refs/heads/main`.
2. Updated GitHub Workflow Secrets:
   * No secrets are explicitly stored in GitHub since Workload Identity Federation uses OIDC tokens. Therefore, I ensured the workflow file has the correct `workload_identity_provider` and `service_account values`:
     ```yaml
     workload_identity_provider: 'projects/89346032191/locations/global/workloadIdentityPools/github-actions-cloud-run/providers/github'
     service_account: 'github-cloud-deploy-sa@service-project-dev-1a.iam.gserviceaccount.com'
     ```
## Notes
- Ensure your GKE cluster has sufficient resources (e.g., 2 nodes with `e2-small` machine type).


