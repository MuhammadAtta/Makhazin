# Makhazin - Web3 Logistics Infrastructure (Repo Skeleton)

This repository is a ready-to-use skeleton for **Makhazin** — an on-demand warehousing platform powered by **Hedera** and **IoT**.

## Repo layout (preview)
- /backend
  - /auth-service
  - /marketplace-service
  - /booking-service
  - /hedera-integration
- /frontend
  - /web (Next.js)
  - /mobile (Flutter)
- /iot
  - /firmware (ESP32 samples)
- /infrastructure
- /docs (pitch deck, submission, demo scripts)

## Quick start (local demo)
1. Clone this repo to your machine.
2. Install Java 17, Maven, Node.js, Flutter (for mobile), Docker.
3. Setup `.env` files according to each service `/backend/*/.env.example`.
4. For Hedera development, use Hedera Testnet: create accounts at https://portal.hedera.com and store your operator ID and keys in the hedera integration service.

## What I delivered
- Project skeleton files and guides to run Hedera testnet locally.
- Smart contract template (Solidity) for rental agreements.
- Java Hedera integration skeleton (sample code).
- Pitch deck (markdown) + submission template.
- Recruitment job posting for Blockchain Developer.

## Next actions
- Push this repo to GitHub under `github.com/MuhammadAtta/makhazin` (or your preferred org).
- Invite contributors and start implementing MVP features.

