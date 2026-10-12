# LaundraLens.ai

LaundraLens.ai is an explainable financial-network intelligence SaaS prototype. Its TRACE engine turns synthetic account and transaction data into investigation leads that analysts can verify against real transaction IDs, timestamps, and account relationships.

![Expo](https://img.shields.io/badge/Expo-React_Native-151116?style=flat-square&logo=expo)
![Fastify](https://img.shields.io/badge/Fastify-TypeScript-151116?style=flat-square&logo=fastify)
![Tests](https://img.shields.io/badge/TRACE-Vitest-dca6cb?style=flat-square)

## Product highlights

- **Financial intelligence command center** with live account, volume, candidate-network, and priority metrics.
- **Real TRACE analysis** computed from deterministic seeded transactions—not prewritten chatbot findings.
- **Hidden-network discovery** using rapid pass-through movement, high-value recurrence, fan-in/fan-out concentration, and circular relationships.
- **Isolated investigation graphs** containing 10–30 relevant accounts and the supporting transfers.
- **Explainable evidence inspector** linking every signal to source transaction IDs and graph edges.
- **Transaction time machine** with play, pause, reset, and direct timeline navigation.
- **Benign vs. suspicious comparison** to make false-positive context visible.
- **Network fingerprint** across structural complexity, temporal unusualness, flow concentration, and relationship density.
- **Responsive Expo client** for web, iOS, and Android, with a dark graphite/plum interface inspired by the supplied palette.

## Architecture

```text
apps/
├── client/                 Expo Router + React Native Web
│   ├── app/                Application shell and command center
│   ├── components/         Network graph and fingerprint visualizations
│   └── lib/                Typed API models and offline demo fallback
└── server/                 Fastify + TypeScript
    └── src/
        ├── data.ts         Deterministic synthetic ledger
        ├── engine.ts       Explainable TRACE heuristics
        ├── engine.test.ts  Analysis and filter tests
        └── index.ts        Validated HTTP API
```

The graph engine uses Graphology for connected-component isolation. The interface renders data-linked graph relationships and fingerprints with `react-native-svg`. Zod validates analysis filters at the API boundary.

## Quick start

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:8081](http://localhost:8081). The API runs at [http://localhost:4000](http://localhost:4000).

The client includes a deterministic offline fallback so the full experience still renders if the API is temporarily unavailable. When both services are running, filters and **Run TRACE analysis** call the typed backend.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Expo web client and Fastify API together |
| `npm run dev:client` | Start Expo only |
| `npm run dev:server` | Start the API only |
| `npm run build` | Compile the API and export the web client |
| `npm run test` | Run TRACE engine and filtering tests |
| `npm run typecheck` | Type-check both workspaces |

For native development, run `npm run ios -w @laundralens/client` or `npm run android -w @laundralens/client` after completing the standard Expo device setup.

## API

### `GET /health`

Returns service readiness.

### `GET /api/datasets`

Returns the available seeded datasets.

### `POST /api/trace`

Runs analysis with validated filters:

```json
{
  "dataset": "all",
  "window": "30d",
  "minAmount": 25000
}
```

The response contains live metrics, in-scope accounts and transactions, candidate networks, evidence signals, graph-edge references, fingerprints, and a benign comparison cohort.

## TRACE heuristics

This prototype intentionally uses transparent heuristics instead of a black-box risk model:

1. Filter the ledger by dataset, time window, and amount.
2. Build an undirected working graph from high-value transfers.
3. Isolate connected components of 4–30 accounts.
4. Compute evidence for rapid relays, concentrated fan patterns, circular movement, and repeated high-value transfers.
5. Derive the four-axis fingerprint directly from graph density, transfer cadence, and flow distribution.
6. Rank the result using a configurable heuristic priority index.

The score is an investigation aid, not an allegation or compliance disposition.

## Seed data and responsible use

All accounts, people, organizations, transactions, and findings in this repository are synthetic. LaundraLens.ai is a product prototype for explainable investigation workflows; it is not production AML software and should not be used to make real-world financial decisions without governance, calibration, and human review.

## License

MIT
