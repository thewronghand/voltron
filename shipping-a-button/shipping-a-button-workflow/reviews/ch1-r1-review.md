# Chapter 1 — review round 1 (Claude opus, independent)

- Target: `git diff main feat/chapter-1-architecture` at f3abe88
- Verdict: **FAIL** — CRITICAL 0, HIGH 3, MEDIUM 8, LOW 5
- Confirmed OK: figures, CSV bytes, JSON shapes, readiness gating, ingest idempotency checks, STRICT mTLS between `acme` services. `npm test` 8/8, `tsc --noEmit` EXIT 0.

## HIGH

1. `services/hierarchy/src/graphs.ts:44` — Neo4j stores `fee_bp` as FLOAT (driver sends JS numbers as Float). Live: `valueType(n.fee_bp)` = `FLOAT NOT NULL`, value `330.0`; Dgraph holds int. The cross-check (lines ~73/88) passes because `disableLosslessIntegers` reads 330.0 back as 330. Violates README §4.2. Fix: write `neo4j.int(bp)` / `toInteger($bp)`; make the cross-check assert the stored type is INTEGER so type drift fails loudly; existing nodes need a rebuild.
2. `infra/k8s/50-ingress.yaml:21-26` + `services/kernel/src/http.ts:9` — Envoy rewrites absolute-form request targets (`GET http://host/m/... HTTP/1.1`) to origin-form and drops `#fragment`. Probed on `.html` routes: `--request-target "http://127.0.0.1:8098/m/M001/2026-07.html"` → 200, `"http://evil.example/m/M001/2026-07.html"` → 200, `"/m/M001/2026-07.html#frag"` → 200. Chapter 0 answers 404 for all of these and never counts them. Same mechanism would make CSV variants presses. Fix: reject absolute-form and fragments at the gateway before routing, or record it in the Compromise Register; add both spellings to parity's 404 list.
3. `services/kernel/src/http.ts:84-89` + `infra/k8s/50-ingress.yaml:33-36` — `/healthz`, `/readyz` publicly routable via portal (200). Chapter 0 answers 404. Fix: probes on a separate non-routed port, or a gateway rule returning 404.

## MEDIUM

4. `/i/*` status semantics differ from Chapter 0: `GET /i/page-viewed` → 405 (Ch0 404), `POST /i/unknown` → 404 (Ch0 405, method checked before routing). Route required by S-01 but not recorded as a deliberate deviation.
5. Data-store traffic (Kafka, Neo4j, Dgraph) is plaintext: injection-disabled namespace, TLS DISABLE, Neo4j auth none, Dgraph admin open. README P-2 permits adaptation only on its two grounds with a Compromise Register entry; neither done.
6. `services/portal/src/main.ts:47-53` — `ready()` on every request = 3 extra mesh round-trips per request; any downstream replay 503s every page, including routes that do not depend on it. Distorts the 200,001-user load test.
7. `services/counter/src/main.ts:7-11` — unbounded `seen` Set of UUIDs vs 256 Mi limit; protects only against double publication the code never does.
8. `services/kernel/src/kafka.ts:19-31` / `infra/k8s/10-data.yaml:73-78` — infinite retention on a 2 GiB PVC, public unauthenticated beacon endpoint appends to it; the log is the only copy of ledger and presses.
9. `docs/architecture/chapter-1.md:101-110` — resource table does not match manifests (real totals ≈ 3.75 GiB requests / 8 GiB limits; CPU limits ≈ 7 cores on a 6-CPU VM).
10. `docs/architecture/chapter-1.md:3,99,153` — stale: claims cluster/mTLS/EnvoyFilter unexecuted; omits `meshConfig.pathNormalization: NONE`; no bootstrap order (kind create → istioctl install → mtls.yaml → up.sh).
11. Redundant mesh config: path normalization disabled by meshConfig and two EnvoyFilters; namespace STRICT PeerAuthentication duplicates mesh-wide; `*.acme` ISTIO_MUTUAL DestinationRule duplicates auto-mTLS.

## LOW

12. `graphs.ts:12-14` — `response.json()` before `response.ok`; non-JSON error bodies become bare SyntaxError.
13. `kernel/src/http.ts:55-59` — upstream 503 surfaced as 502.
14. `kernel/src/kafka.ts:53-55` — producer `ready` relies on CONNECT/DISCONNECT; stays ready during broker outage; doc overstates.
15. `infra/k8s/10-data.yaml` — Kafka governing Service not headless; readiness probe launches a JVM every 15 s.
16. `services/button/src/handler.test.ts:41-43` — `/./` case skipped, promised raw request missing.

## Orchestrator findings from live deployment (not from the reviewer)

- O-1 `kind load docker-image` fails with Docker 29 containerd store (`--all-platforms`). Fixed in `infra/up.sh` with `docker save | ctr import` (keep).
- O-2 Neo4j refused to start: Kubernetes service links inject `NEO4J_PORT_*` env vars that the image parses as config. Fixed with `enableServiceLinks: false` (keep). A StatefulSet does not replace a crash-looping pod on template change; up.sh needs to handle that.
- O-3 Dgraph OOMKilled at 2 GiB (zero + alpha each with GOMEMLIMIT 1536 MiB). Fixed: limit 3 GiB, GOMEMLIMIT 1024 MiB, cache 256 MB (keep).
- O-4 Istio default path normalization turned `/m/M001/./2026-07.csv` and `/m/M001/../M001/2026-07.csv` into the canonical path (200, counted). The EnvoyFilter did not prevent it. Fixed with `meshConfig.pathNormalization: NONE` in `infra/istio.yaml` (keep).
- O-5 hierarchy crashed parsing Envoy's plain-text `no healthy upstream` as JSON (same as #12).
- O-6 hierarchy re-applies the Dgraph schema on every start, triggering index deletion/rebuild (`Deleting indexes for 0-acme.*` in Dgraph logs).
- O-7 counter crashes with UNKNOWN_TOPIC_OR_PARTITION when `interaction.button-pressed.v1` does not exist; after a topic deletion nobody recreated it (button's createTopics had already passed). Consumers must not crash on a missing topic.
- O-8 `tools/parity.ts` compares `/api/counter.json` to Chapter 0's built output (0 presses), so it fails whenever the counter is non-zero. The counter is stateful; compare shape, and use deltas for values.
- O-9 kafkajs logs `TimeoutNegativeWarning: -1792... is a negative number` in several services. Investigate; at minimum explain.
- O-10 `infra/up.sh` statefulset rollouts timed out repeatedly during first deploy; its failure output did not say which pod or why.
