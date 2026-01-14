<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Video Chat WebSocket (Socket.IO) 🔧

This project exposes a Socket.IO namespace for video chat at `/:namespace /video`.

Event names:

- Client -> Server
  - `createRoom` : { userId: string, name?: string } -> creates a room
  - `joinRoom` : { roomId: string, userId: string, role?: string } -> join a room and become a participant
  - `leaveRoom` : { roomId: string, userId: string } -> leave a room

- Server -> Client
  - `room_created` : room object
  - `participant_joined` : participant object
  - `participant_left` : { roomId, userId }

Note: the server gateway is implemented in `src/video-chat/video-chat.gateway.ts` and handled by `VideoChatService` for persistence.

Configuration (STUN/TURN servers)

- Set `VIDEOCHAT_ICE_SERVERS` to a JSON array of ICE server objects as used by RTCPeerConnection.

Example: in your `.env` file

```
VIDEOCHAT_ICE_SERVERS='[{"urls":["stun:stun.l.google.com:19302"]},{"urls":["turn:turn.example.com:3478"],"username":"user","credential":"pass"}]'
VIDEOCHAT_TOKEN_TTL_SECONDS=300
```

If not set, the server will fall back to Google's public STUN server.

TURN (coturn) long-term credential support

- To have the server generate time-limited TURN credentials (coturn LT mode), set `VIDEOCHAT_TURN_SECRET` in your `.env` to the shared secret used by your coturn server, and the server will generate username/credential pairs valid for `VIDEOCHAT_TOKEN_TTL_SECONDS`.

Example `.env` additions:

```
VIDEOCHAT_TURN_SECRET=some_shared_secret_for_coturn
VIDEOCHAT_TOKEN_TTL_SECONDS=300
VIDEOCHAT_ICE_SERVERS='[{"urls":["stun:stun.l.google.com:19302"]},{"urls":["turn:turn.example.com:3478"]}]'
```

Apt (system package) quick start — simple for single server

1. Install coturn via apt (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install coturn
```

2. Configure `/etc/turnserver.conf` (edit or add these lines):

```
lt-cred-mech
use-auth-secret
static-auth-secret=YOUR_LONG_RANDOM_SECRET
realm=example.com
listening-port=3478
fingerprint
min-port=49152
max-port=65535
external-ip=YOUR_PUBLIC_IP  # optional
```

3. Start and enable the systemd service:

```bash
sudo systemctl enable --now coturn
sudo systemctl status coturn
sudo journalctl -u coturn -f
```

4. Open firewall ports (example using UFW):

```bash
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 49152:65535/udp
```

5. Verify with a WebRTC test page (trickle-ice) or the coturn utilities (e.g., `turnutils_uclient`) and look for `relay` ICE candidates.

Quick start with Docker Compose (coturn + redis + backend)

This Compose file is convenient for local development and small single-host deployments. It starts:
- `coturn` (TURN/STUN)
- `redis` (used by Socket.IO adapter and other services)
- `backend` (this NestJS app)

1. Generate a secret (locally):

```bash
# prints a strong secret
./scripts/generate-turn-secret.sh
```

2. Copy the secret into `.env` (DO NOT commit):

```
VIDEOCHAT_TURN_SECRET=<your_secret_here>
```

3. Start the full stack for development (from repo root):

```bash
# start coturn + redis + backend
docker compose -f deploy/coturn/docker-compose.dev.yml up --build -d
```

4. Watch logs and health:

```bash
docker compose -f deploy/coturn/docker-compose.dev.yml logs -f
```

5. Verify connectivity:
- Use a WebRTC tester (e.g., trickle-ice) and look for `relay` ICE candidates.
- Or run the app and open the frontend with WebRTC client to validate end-to-end.

Notes
- The Compose file exposes:
  - Backend: 3005
  - Redis: 6379
  - TURN: 3478 (TCP/UDP) and ephemeral UDP port range 49152–65535
- For local development you can uncomment the `volumes` and `start:dev` command in the Compose file for hot reload.

Run backend in dev mode (hot reload)

If you want the backend to run in dev mode with hot reload inside Compose, edit `deploy/coturn/docker-compose.dev.yml` to mount the source and use the dev command. Example snippet (backend service):

```yaml
  backend:
    build: ..
    image: backend-kit:dev
    volumes:
      - ..:/usr/src/app
    command: ["npm", "run", "start:dev"]
```

Then start only backend (with coturn/redis already running or in separate shells):

```bash
# start coturn and redis first
docker compose -f deploy/coturn/docker-compose.dev.yml up -d redis coturn
# start backend in dev mode
docker compose -f deploy/coturn/docker-compose.dev.yml up --build backend
```

- This approach is convenient for iterative development and live code changes.

Run backend in dev mode (hot reload)

If you want the backend to run in dev mode with hot reload inside Compose, edit `deploy/coturn/docker-compose.dev.yml` to mount the source and use the dev command. Example snippet (backend service):

```yaml
  backend:
    build: ..
    image: backend-kit:dev
    volumes:
      - ..:/usr/src/app
    command: ["npm", "run", "start:dev"]
```

Then start only backend (with coturn/redis already running or in separate shells):

```bash
# start coturn and redis first
docker compose -f deploy/coturn/docker-compose.dev.yml up -d redis coturn
# start backend in dev mode
docker compose -f deploy/coturn/docker-compose.dev.yml up --build backend
```

- This approach is convenient for iterative development and live code changes.
- This setup is intended for local/dev or small-scale single-host deployment; consider Kubernetes/managed TURN providers for HA and scaling.

Kubernetes notes

- The manifest is at `deploy/k8s/coturn-deployment.yml`. Replace the secret value and apply:

```bash
kubectl apply -f deploy/k8s/coturn-deployment.yml
```

- Ensure UDP port 3478 and the ephemeral RTP range (49152-65535/UDP) are allowed in your cloud LB/firewall.

Cost & operational notes

- coturn is open-source and free, but TURN bandwidth is billable by your infrastructure provider (egress traffic).
- If you prefer not to self-host, consider a managed provider (Twilio, Xirsys, Agora) — they provide ephemeral credentials and remove operational burden.


---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).