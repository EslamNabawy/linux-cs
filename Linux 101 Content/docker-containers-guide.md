# Docker & Containers — Full Guide

Images, volumes, networks, and Compose stacks — the four pillars that cover almost everything you'll actually do with Docker day to day.

---

## 0. What a Container Actually Is (Briefly)

A container isn't a lightweight VM — it's a regular process on your host, isolated using two Linux kernel features:
- **Namespaces** — give the process its own isolated view of the filesystem, network, process list, hostname, etc.
- **cgroups** — limit and account for the resources (CPU, memory) that process can use.

**Image vs container — the distinction that trips people up:** an **image** is a read-only template (built once, stored, reused). A **container** is a running (or stopped) instance created *from* an image, with its own writable layer on top. You can run many containers from the same image, exactly like many instances of a class from one class definition.

---

## 1. Installing Docker

```bash
curl -fsSL https://get.docker.com | sudo sh     # official convenience script, quickest path
sudo usermod -aG docker $USER                       # let your user run docker without sudo every time
newgrp docker                                         # apply the new group in your current shell without re-logging in
docker --version
docker run hello-world                                  # confirm it actually works end to end
```

---

## 2. Images — Pulling, Building & Understanding Layers

### Pulling existing images
```bash
docker pull nginx                  # latest tag, from Docker Hub by default
docker pull nginx:1.25-alpine        # a specific tag — always prefer pinning a real version over "latest" in anything you'll rely on
docker images                          # list images stored locally
docker rmi nginx                        # remove an image (fails if a container is still using it)
```

**Why pinning matters:** `latest` is just a tag, not a guarantee — it moves as the maintainer pushes new builds. A `docker-compose.yml` that says `image: nginx:latest` can pull a genuinely different image next month than it did today, silently. Pin real versions (`nginx:1.25-alpine`) for anything beyond quick local testing.

### Building your own image — Dockerfile anatomy
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["python3", "app.py"]
```

| Instruction | Meaning |
|---|---|
| `FROM` | the base image everything else builds on top of |
| `WORKDIR` | sets the working directory inside the image for subsequent instructions |
| `COPY` | copies files from your build context into the image |
| `RUN` | executes a command **at build time**, its result gets baked into the image layer |
| `EXPOSE` | documents which port the container listens on (doesn't actually publish it — that's done at `docker run`, see networks section) |
| `ENV` | sets an environment variable inside the running container |
| `CMD` | the default command run **when the container starts** (not build time) — can be overridden at `docker run` |
| `ENTRYPOINT` | similar to `CMD` but harder to override — commonly paired with `CMD` supplying default arguments to it |

### Layers — why instruction order matters for build speed
Each instruction creates a new **layer**, and Docker caches layers — if a layer's inputs haven't changed, it's reused instead of rebuilt. This is why `COPY requirements.txt .` and `RUN pip install` happen **before** `COPY . .` in the example above: your dependency list changes far less often than your actual code, so ordering it first means most rebuilds skip the (usually slow) dependency install step entirely and only re-run the fast final copy.

```bash
docker build -t myapp:1.0 .              # build from the Dockerfile in the current directory
docker build -t myapp:1.0 -f Dockerfile.prod .   # use a specifically-named Dockerfile
docker history myapp:1.0                   # see every layer and its size — useful for hunting bloat
```

### `.dockerignore` — keep the build context small
```
.git
node_modules
*.log
.env
```
Same role as `.gitignore` but for what gets sent to the Docker build process — a large, unfiltered context slows every build down.

---

## 3. Containers — Running & Managing

```bash
docker run nginx                          # run in foreground, attached
docker run -d nginx                          # detached — runs in background, returns your shell immediately
docker run -d --name myweb nginx               # give it a memorable name instead of a random one
docker run -d -p 8080:80 nginx                   # map host port 8080 to container port 80
docker run -d -e APP_ENV=production myapp         # set an environment variable
docker run -d --restart unless-stopped myapp        # auto-restart policy — see below

docker ps                                              # list RUNNING containers
docker ps -a                                             # list ALL containers, including stopped ones
docker stop myweb
docker start myweb
docker restart myweb
docker rm myweb                                            # remove a stopped container
docker rm -f myweb                                           # force-remove, even if running
```

### Restart policies
| Policy | Behavior |
|---|---|
| `no` (default) | never auto-restarts |
| `on-failure` | restarts only on a non-zero exit code |
| `always` | always restarts, including after a manual stop and a host reboot |
| `unless-stopped` | like `always`, but respects a manual `docker stop` — won't restart until you explicitly start it again |

**`unless-stopped` is the right default for most real services** — it survives crashes and host reboots, but doesn't fight you when you deliberately stop it for maintenance.

### Interacting with a running container
```bash
docker logs myweb                    # see its stdout/stderr
docker logs -f myweb                   # live-tail, like tail -f
docker exec -it myweb bash              # open an interactive shell INSIDE the running container
docker exec -it myweb sh                 # use sh instead if the image is minimal (alpine-based, no bash)
docker inspect myweb                       # full JSON detail — IPs, mounts, env vars, everything
docker stats                                 # live resource usage (CPU/mem) across all running containers
```

---

## 4. Volumes — Persisting Data Beyond a Container's Lifetime

Without a volume, anything written inside a container disappears the moment that container is removed — the writable layer is tied to the container, not the image. Volumes solve this.

### Three types
| Type | Where it lives | Use for |
|---|---|---|
| **Named volume** | Managed by Docker, under `/var/lib/docker/volumes/` | The default choice for most persistent data (databases, uploaded files) |
| **Bind mount** | An exact path YOU choose on the host | When you need direct host access to the files (e.g. live-editing code during development) |
| **tmpfs mount** | RAM only, never touches disk | Sensitive temp data, or a performance-critical scratch space |

```bash
# Named volume — Docker manages the actual location
docker run -d -v mydata:/var/lib/mysql mysql
docker volume ls
docker volume inspect mydata

# Bind mount — you specify the exact host path
docker run -d -v /home/solo/project:/app myapp

# tmpfs — RAM-backed, gone on container stop
docker run -d --tmpfs /app/cache myapp
```

**Practical rule of thumb:** named volumes for anything you want Docker to manage and back up as a unit (databases especially); bind mounts specifically when you need to actively edit files from the host side while the container runs (classic dev workflow — edit code locally, container picks it up live).

```bash
docker volume rm mydata                # delete a named volume (fails if in use)
docker volume prune                       # remove ALL unused volumes — be sure nothing important is only referenced there
```

---

## 5. Networks — How Containers Talk to Each Other and the World

### Default network types
```bash
docker network ls
```
| Driver | Behavior |
|---|---|
| `bridge` (default) | isolated internal network, containers can reach each other by IP, and the host via port mapping |
| `host` | container shares the host's network stack directly — no isolation, no port mapping needed, but no isolation either |
| `none` | no networking at all |

### Publishing a port — making a container reachable from outside
```bash
docker run -d -p 8080:80 nginx
#              │    │
#              │    └─ container's internal port
#              └────── host's port, what you actually connect to
```
```bash
docker run -d -p 127.0.0.1:8080:80 nginx     # bind ONLY to localhost — not reachable from outside the host at all
```
This mirrors the "bind to localhost" principle from the hardening guide — if a service genuinely doesn't need external access, don't expose it beyond the loopback interface.

### Custom networks — the right way for multi-container communication
```bash
docker network create mynet
docker run -d --name db --network mynet postgres
docker run -d --name app --network mynet myapp
```
Containers on the same custom network can reach each other **by container name** as a hostname — `app` can connect to `db:5432` directly, no IP addresses or port mapping needed between them. This is the real reason to create custom networks instead of relying on the default bridge, where name-based resolution isn't guaranteed the same way.

---

## 6. Docker Compose — Multi-Container Stacks Declaratively

Compose lets you define an entire multi-service stack (app + database + cache, etc.) in one YAML file instead of a string of individual `docker run` commands.

### Anatomy of a `docker-compose.yml`
```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "8080:8000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./app:/app          # bind mount for live code editing during dev

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  db_data:
```

**Key things this file does automatically that raw `docker run` doesn't:**
- Creates a dedicated network for the whole stack, so `app` can reach `db` and `redis` by service name — no manual `docker network create` needed.
- `depends_on` controls **start order** (though notably not "wait until actually ready" — see the health check note below).
- One command spins up or tears down the entire stack together, consistently.

### Core commands
```bash
docker compose up -d              # start the whole stack, detached
docker compose down                 # stop and remove containers (volumes persist unless you add -v)
docker compose down -v                # stop AND remove volumes too — destructive, deletes your data
docker compose ps                       # status of every service in the stack
docker compose logs -f app                # live logs for one specific service
docker compose logs -f                      # live logs for the WHOLE stack, interleaved
docker compose build                          # rebuild images defined with a `build:` key
docker compose restart app                      # restart just one service
docker compose exec app bash                      # shell into a running service
```

### The `depends_on` gotcha
`depends_on` only waits for the dependency container to **start**, not for the application inside it to actually be ready to accept connections — a database container can report "started" well before Postgres has finished initializing. For anything that genuinely needs to wait for real readiness, add a health check:
```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      db:
        condition: service_healthy    # NOW it actually waits for db to be truly ready
```

---

## 7. Practical AIOps Example — A Monitoring Stack via Compose

Directly relevant to your important-files list from earlier — Prometheus + Grafana as an actual runnable stack:

```yaml
version: "3.9"

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prom_data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"     # local-only — reach it through a reverse proxy or SSH tunnel, not directly exposed
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prom_data:
  grafana_data:
```

```bash
docker compose up -d
docker compose logs -f grafana     # confirm it started cleanly
```
This gives you a persistent, restart-safe monitoring stack in about 20 lines — genuinely representative of how much of real AIOps tooling gets deployed in practice.

---

## 8. Debugging & Common Issues

```bash
docker logs <container>                        # first stop, always — most failures explain themselves here
docker inspect <container> --format '{{.State.ExitCode}}'   # what exit code did it die with
docker events                                       # live stream of Docker daemon events — useful for catching a container that keeps restarting
docker exec -it <container> sh                          # get inside it and poke around directly
```

| Symptom | Likely cause |
|---|---|
| Container exits immediately after start | The main process (`CMD`) finished/crashed instantly — check `docker logs`; a common cause is running an interactive-only process without `-it`, or a missing dependency inside the image |
| `Cannot connect to the Docker daemon` | Docker service isn't running (`sudo systemctl status docker`), or your user isn't in the `docker` group yet |
| Port already in use | Something else on the host (or another container) already bound that port — `sudo ss -tulnp \| grep <port>` to find it |
| Container can't reach another container by name | They're not on the same custom network — check with `docker network inspect <network>` |
| Changes to code aren't showing up | If using a bind mount, confirm the path is actually correct; if not using one, you need to rebuild the image (`docker compose build`) since the old code is baked into the image layer |

---

## 9. Cleanup & Maintenance

```bash
docker ps -a                            # see what's actually accumulated
docker container prune                    # remove all stopped containers
docker image prune                          # remove dangling (untagged) images
docker image prune -a                         # remove ALL unused images, not just dangling ones — more aggressive
docker volume prune                             # remove unused volumes — be careful, this can delete real data
docker system prune -a --volumes                  # nuclear option — cleans everything unused across the board
docker system df                                     # see how much disk Docker is actually using, broken down by category
```

**Worth running periodically on any dev machine** — Docker images and build cache accumulate fast, and `docker system df` is the quickest way to see where your disk actually went before you go hunting manually.

---

## Quick Reference

```
IMAGES        docker pull <image>:<tag>       docker build -t <name> .        docker images
CONTAINERS     docker run -d -p <host>:<container> --name <name> <image>
                docker ps -a     docker logs -f <name>     docker exec -it <name> sh
VOLUMES         docker run -v <volume>:<path>     docker volume ls
NETWORKS         docker network create <name>     docker run --network <name>
COMPOSE           docker compose up -d     docker compose down     docker compose logs -f
CLEANUP            docker system df     docker system prune -a --volumes

ALWAYS PIN VERSIONS, NEVER RELY ON :latest FOR ANYTHING YOU NEED TO TRUST.
```
