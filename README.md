# Myotain

This project uses a containerized Next.js frontend. All dependencies and build environments are handled automatically via Docker.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

To build the images and spin up the containers, run the following command from the root directory:

```bash
docker compose up --build -d
```

The `--build` flag ensures that Docker reads the `package.json` and installs all necessary dependencies (`node_modules`) directly into the container image. 

Once running, the frontend will be accessible at:
`http://localhost:3000`

## Stopping the Environment
To stop the containers gracefully, run:
```bash
docker compose down
```
