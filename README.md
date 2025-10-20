# Virtual Consultant

This is an internal repository for the Virtual Consultant application.

## Project Overview

The project is a web application with a frontend built in React/TypeScript and a backend composed of a .NET Core API and a Python worker agent. The infrastructure is managed with Docker and Terraform.

## Getting Started

### Running Locally (Development Environment)

The entire project stack can be run locally using Docker. The `infra/docker-compose.yml` file is configured for a local development environment. All dependencies are managed by Docker.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Set up environment variables:**
    - An example `.env` file is provided in the `infra` directory. Copy this to `.env` and modify as needed.
    - The `server/api` directory also contains sample environment files.
3.  **Run the application:**
    ```bash
    docker-compose -f infra/docker-compose.yml up -d
    ```

## Application Structure

-   **`app/web`**: The React/TypeScript frontend application.
-   **`server/api`**: The .NET Core API.
-   **`server/agent`**: The Python worker agent.
-   **`infra`**: Contains the `docker-compose.yml` for local development and Terraform configurations for AWS deployment.
-   **`scripts`**: Build and deployment scripts.

## Deployment (AWS)

Deployment to AWS is handled by Terraform. The scripts in the `scripts` directory are used to build and push the Docker images to a container registry (likely ECR) and then deploy the services using Terraform.

-   **Prerequisites**: The AWS CLI must be configured with the appropriate credentials.
-   `deploy_qa.sh`: Deploys the application to the QA environment.
-   `deploy_prod.sh`: Deploys the application to the production environment.

## Application Structure

-   **`app/web`**: The React/TypeScript frontend application.
    -   To run locally: `npm install && npm run dev`
    -   To build: `npm run build`
-   **`server/api`**: The .NET Core API.
    -   To run locally: `dotnet run`
-   **`server/agent`**: The Python worker agent.
    -   To run locally: `pip install -r requirements.txt && python main.py`
-   **`infra`**: Docker and Terraform configuration.
-   **`scripts`**: Build and deployment scripts.

## Deployment

The application is deployed using the scripts in the `scripts` directory. These scripts build the Docker images, push them to a container registry (likely ECR), and then use Terraform to deploy the services.

-   `deploy_qa.sh`: Deploys the application to the QA environment.
-   `deploy_prod.sh`: Deploys the application to the production environment.
