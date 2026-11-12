# Chapter 1 — review round 3 (Claude opus, independent, fresh)

- Target: `git diff main feat/chapter-1-architecture` at 2df63ae (66 files)
- Verdict: **FAIL** — CRITICAL 0, HIGH 1, MEDIUM 4, LOW 3
- Verified clean: AuthorizationPolicies live (denied 403: counter→hierarchy, button→counter, button→settlement:8081, portal→dgraph, portal→neo4j:7474, counter→portal; allowed: button→settlement:8080, portal→hierarchy); Kafka volume migration keeps history; ingest checks all input topics first; exact-count readiness and every-join prefix verification; press event_id frozen before retries, LRU dedupe works; Neo4j/Dgraph fee_bp type checks; resource table matches manifests; no `any`, no `../`; counter total equals press-topic end offset. `npm test` 31/31, `tsc` 0.

## HIGH

1. `infra/k8s/20-mesh.yaml:28-30`, `kernel/src/http.ts:89`, README §6 — request forms with a different status/press delta from Chapter 0, neither fixed nor registered (confirmed live on JSON/HTML paths; CSV deltas inferred from identical routing):
   1. Request line with no HTTP version (`GET /m/M001/2026-07.html\r\n\r\n`): Ch1 answers `HTTP/1.0 200` (side effect of `accept_http_10`); Ch0's request-line regex requires `HTTP/1.[01]` → 400/+0. CSV: Ch1 200/**+1** vs Ch0 400/+0.
   2. Pipelined / keep-alive: three GETs in one write → three 200s; sequential keep-alive works. Ch0 answers one request per connection and closes. CSV: Ch1 +3 vs Ch0 +1.
   3. Large header blocks: 7,852–8,192 bytes → 431 (last 200 at 7,851; Envoy adds ~340 bytes before Node's 8,192 limit). Ch0 accepts up to 8,192 → CSV 200/+1 vs 431/+0. Above 8,192: Ch0 400, Ch1 431.
   4. Bytes Ch0 tolerates but the codec rejects (400): bytes ≥0x80 or DEL in the query (Ch0 200, CSV +1); header line without colon, control byte in a header, Content-Length with Transfer-Encoding (Ch0 never parses headers → 200/+1); high byte in the path (Ch0 404, Ch1 400); target without leading slash (Ch0 404, Ch1 400).
   5. Status-only: `CONNECT /missing` → 400 and `CONNECT host:port` → 404 (Ch0 405); a client that never finishes headers: Ch0 408 after 5 s, Ch1 no response after 12 s.
   Suggested: Envoy `request_headers_timeout: 5s` (408); `max_requests_per_connection: 1`; raise Node `maxHeaderSize` above 8,192 + Envoy overhead; refuse the version-less line if possible.

## MEDIUM

2. `docs/architecture/chapter-1.md:1-5,187,252-271`; `README.md:226` — stale: says round 3 awaits deployment / "round-3 fixes pending cluster verification"; claims an unverifiable "independent diff review passed with zero findings across 32 files". Update to deployed and verified state.
3. `services/kernel/src/figures.ts:72-78,127-131`; events/validation — money held in JS `Number` (IEEE-754 binary64). Exact within safe-integer checks, but README §4.2 says floating point is not permitted anywhere money is concerned. Use `BigInt` for amounts, fees and totals (topics/JSON keep integers).
4. `services/hierarchy/src/main.ts:6-7`; `kernel/src/kafka.ts:138-146` — hierarchy crashes on brief store outages: top-level `graphs.initialize()` without retry; a single failed Neo4j/Dgraph write during replay → `process.exit(1)`; readiness/liveness ignore the stores after startup, so a lost/emptied graph volume leaves it Ready while every read 500s until manual restart. Retry init and applies; include a cheap check of both graphs in readiness.
5. `infra/up.sh:118-121`, `infra/k8s/10-data.yaml`, `services/Dockerfile` — `neo4j:5.26-community` and `node:24-slim` are floating tags; others pinned by tag not digest; `docker pull` only when missing. istioctl gate accepts any 1.31.x though C-12/C-13 were recorded on 1.31.2 / Envoy 1.39. Pin by digest and pin the exact Istio patch.

## LOW

6. `planning/00-기획.md` §9 lacks C-11..C-13 entries (orchestrator has since added them — no action for the implementer).
7. `services/kernel/src/http.ts:62-66,104` — public error bodies expose internals (`Upstream 404: not found`, `Unavailable upstream: http://settlement.acme.svc.cluster.local:8080`, hierarchy's disagreement message with full projection JSON). Public body generic like Chapter 0; details in logs.
8. `infra/k8s/40-services.yaml`, `10-data.yaml` — Kubernetes API tokens mounted in every pod; none need the API. `automountServiceAccountToken: false` on the dedicated ServiceAccounts.
