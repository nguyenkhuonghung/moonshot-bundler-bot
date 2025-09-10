# Moonshot Bundler Bot

High‑speed bundler and volume bot for Moonshot on Solana. Build and send bundled transactions (priority fees, ATAs, placeholder swaps) with low latency. Includes Telegram alerts and a CLI.

## What is Moonshot?

Moonshot is a Solana DEX focused on ultra‑fast token launches and micro‑cap trading. It lets you trade new tokens instantly, using AMMs and Solana’s low‑latency network.

## Features

- Bundled transaction builder (priority fees + multi‑ix)
- Create ATAs, SOL transfers, and swap placeholders
- Volume bot with rate limiting
- Telegram notifications for key actions
- TypeScript, @solana/web3.js, SPL tokens

## How it works

1) Build a bundle of instructions from config
2) (Optional) add priority fees and compute units
3) Send one transaction containing all actions
4) Confirm and notify via Telegram

## Quick Start

### Prerequisites

- Node.js >= 18.17
- Solana RPC (Helius/Triton or mainnet RPC)
- bs58‑encoded keypair secret

### Install

```bash
npm install
```

### Configure

Copy `env.example` to `.env` and fill values:

```ini
RPC_URL=https://api.mainnet-beta.solana.com
KEYPAIR_BASE58=...
LOG_LEVEL=info
TELEGRAM_BOT_TOKEN=123:ABC
TELEGRAM_CHAT_ID=123456789
```

Use example configs:

- `config.bundle.example.json`
- `config.volume.example.json`

### Run

```bash
npm run build
node dist/index.js bundle -c config.bundle.example.json --dry-run
node dist/index.js volume -c config.volume.example.json
```

## Bot Workflows

- Sniper: monitor → validate → buy → confirm → alert → optional auto‑sell
- Volume: timed loop → buy/sell with small sizes and rate limits

## Notes

- Replace placeholder `moonshotProgram` with the real program id when available.
- Integrate with actual Moonshot pool swap/route for production.

## Telegram Contact

- Contact: t.me/@lorine93s

