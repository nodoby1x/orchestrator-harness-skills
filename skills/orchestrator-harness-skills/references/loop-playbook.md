# Loop Playbook — Phase-by-Phase Runbook

A runbook for driving CONTEXT -> OBSERVE -> REASON -> ACT -> repeat. Each phase
has a short worked micro-example. Self-contained: no sibling skills are invoked;
pillar depth is in `references/harness-pillars.md`; the security gate is in
`references/governance.md`.

Worked goal used throughout: *"Audit this repo's auth code for vulnerabilities."*

## Phase 0 — CONTEXT

Restate "done", name the judge, load prior state, gather at the right altitude.

> **Micro-example.** Restate: "Done = a list of concrete auth vulnerabilities in
> this repo, each with file, line, and severity, judged correct against the actual
> code." Default noted: "Covering the auth module only; not third-party libs —
> flag if that is wrong." Read memory: no prior audit on record.

## Phase 1 — OBSERVE

Cheap orientation yourself; read incoming results in full; reconcile; no silent caps.

> **Micro-example.** Glob for auth files, find the login/session/token entry
> points, scope roughly 9 files. Record the cap: "9 auth files in scope; password
> reset flow lives in a separate service, out of scope this pass."

## Phase 2 — REASON

Decompose into the smallest independent set; keep a visible plan; decide parallel
vs. barrier; choose capabilities; run the pre-ACT gate for any state change.

> **Micro-example.** Three independent subtasks: (a) session/token handling,
> (b) input validation on login, (c) access-control checks. All read-only, so all
> parallel, no barrier. The audit changes no state, so the gate passes; a fix
> wave later WOULD require the gate (see `references/governance.md`).

## Phase 3 — ACT

Spawn specialists in a SINGLE message; give each objective + context + result
shape + boundaries; persist intermediate results.

> **Micro-example.** One message launches three subagents. Each brief: objective
> ("find auth vulns in <area>"), context (the relevant files), result shape
> ("table: file | line | issue | severity"), boundaries ("only <area>; do not fix").
> As each returns, write its verified findings to memory.

## Loop back — track & adapt

Update the plan, reconcile conflicts, fan out a second wave for missing coverage
or shaky claims. Return to CONTEXT until the goal is met.

- **Wave budget — stop and deliver.** Set an explicit iteration/wave budget up
  front. If you reach it without meeting the success test, STOP — deliver a
  best-effort result with an honest accounting of what remains. Never loop
  indefinitely chasing an unbounded goal.
- **When a subagent or tool call fails, returns empty, or times out:**
  1. **Classify.** Transient (timeout, flaky tool, network) vs. structural (wrong
     approach, missing capability, impossible scope).
  2. **If transient,** retry once with a tightened brief.
  3. **If structural,** re-scope the subtask or escalate/surface it to the human.
  4. **Never silently drop it.** Record any unrecovered failure as a disclosed gap
     in the final accounting.

## Delegation patterns

- **Single-wave fan-out.** N independent subtasks, one message, no barrier. The
  default for breadth (audits, surveys, multi-file scans).
- **Multi-wave.** Wave 1 maps the territory; wave 2 digs into what wave 1 surfaced.
  Justified when later work depends on earlier discovery, not on raw parallelism.
- **Adversarial-verify wave.** After a claim-producing wave, spawn a subagent to
  challenge the shakiest claims against the source. Use for correctness-sensitive
  output before declaring done.
- **When a barrier is justified.** Only when a step needs every prior result
  together (a synthesis comparing all branches). Never barrier independent work.
- **Continue vs. spawn-fresh.** Message the SAME subagent to extend its work with
  context intact; spawn fresh only for genuinely independent work or a clean frame.

## Verify-before-done checklist

- Are correctness-sensitive claims checked against the SOURCE, not against a
  subagent's self-report? A passing self-narrative is NOT evidence.
- Is every coverage cap from OBSERVE still disclosed in the final answer?
- Are conflicting subagent results reconciled, not silently dropped?
- Is each "done" claim backed by primary-source confirmation?

If any check fails, run another pass — do not exit.

## Synthesizing one voice

- **Distill, do not dump.** Subagent transcripts are visible only to you. Relay
  what matters; strip the scaffolding.
- **One structure.** Merge results into a single organized answer (one ranked
  list, one table), not a stack of per-subagent sections.
- **Carry the gaps forward.** State skips, caps, and unverified items plainly in
  the final answer — honest accounting is part of the deliverable.
- **Why distill works.** Each subagent ran in its own isolated context window and
  handed back only a distilled result — the deep detail stayed quarantined there,
  off your reasoning thread. Distilling protects that quality; dumping the raw
  transcripts would undo it.
- **One voice.** However many agents ran, the user gets one coherent response.
