# Chapter 1 — review round 2 (Claude opus, independent, fresh)

- Target: `git diff main feat/chapter-1-architecture` at 8ab8b44
- Verdict: **FAIL** — CRITICAL 0, HIGH 1, MEDIUM 6, LOW 3
- Verified clean: Kafka volume migration and up.sh have no data-loss path (marker-gated copy, scale-to-0 first, old PVC retained); patch-kafkajs.ts is exact, idempotent, fails closed and is present in the running image; money integer-exact; Neo4j/Dgraph compared on every read including integer types; ingest validates topics and refuses partial logs; resource table matches manifests (1290m/5650m CPU, 4416/9344 MiB steady); no `any`, no `../`, no secrets; `npm test` 21/21; `tsc --noEmit` 0.

## HIGH

1. `infra/k8s/20-mesh.yaml:28` (ingress codec) — the gateway rejects requests Chapter 0 answers and counts:
   - `GET … HTTP/1.0` (with or without Host) → **426 Upgrade Required** (verified on `/api/periods.json` with curl --http1.0 and a raw socket). Chapter 0 speaks HTTP/1.0 and its press regex accepts `HTTP/1\.[01]`, so a CSV request over HTTP/1.0 is 200/+1 in Ch0 and 426/+0 in Ch1. **Fixable**: add `accept_http_10: true` and `default_host_for_http_10: <ingress authority>` to the existing `http_protocol_options` MERGE; add raw HTTP/1.0 cases to parity.
   - HTTP/1.1 without Host → **400** (Ch0: 200/+1). Believed not configurable in Envoy (reviewer unconfirmed) → register next to C-12 under P-2 (1) with exact statuses and press deltas, after confirming.
   - Unknown or lowercase methods (`FOO`, `get`) → 400 (Ch0: 405). No press impact; register, and fix `docs/architecture/chapter-1.md:41/43` which claims 405 for every non-GET.

## MEDIUM

2. `services/kernel/src/kafka.ts:17` (+ consumer config ~127-131) — live projections lose group membership: broker logs "removing member … on heartbeat expiration" (hierarchy 07:57:55, 08:03:39; settlement 07:59:25); 7–11 `[RequestQueue] Response without match` per service per 30 min (client request timeouts); settlement readiness timed out 08:03:22 and `/api/periods.json` returned 503 "route dependencies unavailable" while all pods were Ready. Likely cause: fetch request timeout = max(requestTimeout 5000, maxWaitTime 5000 + 100) = 5100 ms vs a ~5000 ms broker long-poll through two CPU-limited sidecars (100 ms margin). Offsets are never committed, so every rejoin re-fetches from offset 0 (116,796 records at 250m CPU). Fix: requestTimeout well above maxWaitTimeInMs (or maxWaitTimeInMs ≈ 1000); on re-joins seek to `progress.nextOffset`. Confirm no evictions/503 over 30+ min.
3. `kafka.ts:135,174` / `replay.ts:41-47` — the prefix fingerprint check runs only on monitor-initiated restarts. KafkaJS-internal re-joins re-read from 0 with `verifying` empty and skip by offset without hash checks, so the doc's claim (chapter-1.md:71) about detecting deletion+regrowth holds only for monitor restarts. Fix: treat every GROUP_JOIN after the first as a replay, or seek past the applied prefix.
4. `kafka.ts:84-94` + `counter/src/main.ts` — the monitor's `producer.connect()` after DISCONNECT re-initialises the idempotent producer ID; a publish retry crossing it can append a second ButtonPressed for one written response; counter does not dedupe → +2 for one press under broker faults. Also settlement accepts more ledger records than `inputCounts` with no tx_id check, so an over-complete ledger would be served as ready with wrong figures. Fix: settlement fails readiness unless the end offset equals exactly 116,796 (and the expected node/edge counts); presses dedupe on event_id within a bounded, documented window.
5. `README.md:175` (C-11) — the P-2 (1) ground holds for `button-hovered` (not observable server-side) but not for `page-viewed` / `period-selected`: the portal already receives those GETs. Derive those two server-side and shrink C-11 to the hover beacon only, or justify.
6. `infra/k8s/10-data.yaml:132`, `infra/mtls.yaml` — STRICT mTLS verified working (plaintext reset by peer; every store pod has istio-proxy; no exclusions). But no AuthorizationPolicy, all workloads use the default ServiceAccount, Neo4j `NEO4J_AUTH=none`, Dgraph admin (/alter, drop_all) open: any mesh workload, including the public-facing interactions service, can write or drop stores. Fix: one ServiceAccount per service; AuthorizationPolicies on acme-data (Kafka: ingest, button, interactions, and the projection consumers; Neo4j and Dgraph: hierarchy only) and on acme services (only the callers that need them).
7. `infra/up.sh:54-56` — istioctl, kind node image and Istio version not pinned or checked; fragment rejection and `allow_absolute_url` behaviour are version-sensitive (validated on Istio 1.31.2, kind v0.33.0). Fix: assert istioctl client/control plane 1.31.x; pin the kind node image in kind.yaml.

## LOW

8. `docs/architecture/chapter-1.md:5,167`, `README.md:225` — stale status (round 2 is deployed: `log-kafka-0` migrated, `data-kafka-0` retained, parity passing).
9. `docs/architecture/chapter-1.md:75` — says "classic sidecar"; installed Istio injects native sidecars (istio-proxy as init container). `/quitquitquit` no longer needed. Reword.
10. `services/kernel/src/http.ts:98` — readiness gate before method checks: non-GET (and POST to unknown `/i/*`) get 503 instead of 405 while unready; reverses method-before-route ordering during replay.
