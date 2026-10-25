
# DeutschMentor AI — Production Deployment

## Overview

DeutschMentor AI will be publicly hosted using
Docker and Kubernetes (K3s).

The React frontend and FastAPI backend will run
as independently deployable containers.

## Infrastructure

- Hosting: Linux VPS
- Containerization: Docker
- Orchestration: Kubernetes (K3s)
- Container Registry: GitHub Container Registry
- Ingress Controller: Traefik
- Database: Managed PostgreSQL with pgvector
- SSL/TLS: HTTPS with automated certificates
- CI/CD: GitHub Actions

## Frontend

- React + TypeScript application
- Production build served through Nginx
- Deployed as a Kubernetes Deployment
- Publicly accessible through HTTPS
- Uses relative /api/v1 routes in production

## Backend

- Python FastAPI application
- Separate Kubernetes Deployment and Service
- Exposes versioned /api/v1 endpoints
- Connects to PostgreSQL and external AI APIs
- Provides health and readiness endpoints
- API credentials remain on the server

## Database

- Managed PostgreSQL with pgvector
- Database credentials supplied securely
- Schema migrations using Alembic
- Automated backups and restore procedures

## Kubernetes

- Deployments for frontend and backend
- ClusterIP Services for internal communication
- Traefik Ingress for external traffic
- ConfigMaps for non-sensitive configuration
- Secrets for sensitive configuration
- Readiness and liveness probes
- CPU and memory resource limits

## CI/CD

1. Open a pull request.
2. Run automated tests and linting.
3. Review and merge into main.
4. Build versioned Docker images.
5. Publish images to GitHub Container Registry.
6. Deploy approved images to Kubernetes.
7. Verify application health after deployment.

## Security

- HTTPS for all public endpoints
- No secrets committed to Git
- API authentication and rate limiting
- Restricted database network access
- Restricted Kubernetes administrative access
- Automated dependency and image scanning

## Monitoring

- Application and container logs
- Health and readiness checks
- Basic uptime monitoring
- API error and latency tracking
- OpenAI usage and cost monitoring

## Production Environment

Public URL: To be configured
Hosting provider: To be selected
Deployment status: Planned
