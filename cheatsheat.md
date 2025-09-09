<!-- Building Docker Images freshly -->
docker compose build --no-cache

<!-- Starting the services -->
docker compose up -d

<!-- Stopping the services -->
docker compose down

<!-- Viewing the logs -->
docker compose logs

<!-- Live logs -->
docker compose logs  -f

- The above are for all services specified in the docker compose file.
- You can specify a particular service by appending its name to the command, e.g., `docker compose logs <service_name>`.