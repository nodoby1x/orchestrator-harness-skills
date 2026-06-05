# Harness Pillars — Depth

The loop (CONTEXT -> OBSERVE -> REASON -> ACT) is the engine. The five pillars —
PROMPT, ORCHESTRATION, MEMORY, TOOLS & SKILLS, and SECURITY & GOVERNANCE — are
what the loop reaches for at each phase. CONTEXT is a loop phase rather than a
pillar; it is covered here for convenience. This file is self-contained: it
describes the pillars as harness concepts you apply directly, not as separate
skills to invoke. Security and governance depth lives in `references/governance.md`.

## PROMPT — goal-framing

The framed goal is the input that drives the whole loop. Before any work:

- **Restate the goal** in 1-2 sentences: what does "done" actually mean?
- **Name the judge and the success test.** Who or what evaluates the result, and
  by what criterion would they call it complete and correct?
- **Separate constraints from preferences.** Constraints are hard (must not break
  the build, must stay under a size limit); preferences are soft (style, ordering).
- **Name what is out of scope** so subagents do not wander into it.
- Surface genuine ambiguity ONLY when a wrong guess is costly. Otherwise pick the
  sensible default and note it in the restatement.

A weak frame produces confident work on the wrong target. Frame first.

## ORCHESTRATION — decompose & delegate

- **Find the decomposition seams.** Split along lines where pieces are
  *independent* (can run in parallel) and *clearly scoped* (each knows exactly
  what to return). Prefer independent over dependent work. Choose the SMALLEST
  sufficient set of subtasks — not the most.
- **The subagent brief shape.** Every delegated task MUST carry four things:
  1. **Objective** — one sharp sentence of what to achieve.
  2. **Context** — the minimum the subagent needs to start; do not dump everything.
  3. **Result shape** — the exact form you want back (a list, a verdict, a diff,
     a table). Name it so synthesis is mechanical.
  4. **Boundaries** — explicit scope limits so it does not expand the task.
- **Size the fan-out to the work.** Match the number of subagents to task
  complexity: ~1 for a simple lookup or fact-find, 2–4 for a comparison, more (up
  to ~10+) only for genuinely broad, parallelizable work. Do NOT over-spawn on
  simple goals — parallel fan-out has real token cost (a multi-agent fan-out can
  cost many times a single pass). Spawn the fewest subagents that cover the
  independent seams.
- **Single-message parallel fan-out.** Launch all independent subagents in ONE
  message so they execute concurrently. Sequential launches forfeit the speedup.
- **Continue-a-subagent vs. spawn-fresh.** To extend work with its context intact,
  message the SAME subagent again. Spawn a fresh one only when the new task is
  genuinely independent or needs a clean frame.
- **When a barrier is justified.** Wait-for-all only when a later step genuinely
  needs every prior result together (e.g., a synthesis that compares all branches).
  A barrier on independent work is wasted wall-clock.

## CONTEXT — gather & manage working context

- **Progressive disclosure.** Load only what the current phase needs. Pull deeper
  detail on demand, not preemptively. An overstuffed context degrades reasoning.
- **Right altitude.** Do cheap orientation yourself (list files, find entry
  points, scope the diff); push the deep reads into delegated subtasks.
- **No silent truncation.** If you bound coverage — top-N, sampled, skipped a
  module — record it. A silent cap reads as "covered everything" when it did not.
- **Compaction.** When context grows large or nears the window limit, distill the
  working thread — goal, plan status, verified findings, open gaps — into a compact
  summary and continue from it. Clear stale raw tool and subagent outputs first.
  Lean on MEMORY as the durable backing store so nothing important is lost.

## MEMORY — persist state

- **What to persist:** the framed goal, the plan with current status, verified
  findings, and open gaps. Do NOT persist raw subagent transcripts — distill first.
- **Keep a concrete status artifact.** Maintain a living plan/status record with
  per-subtask status (pending / done / failed), verified findings, and open gaps.
  Update it as results land; read it at the start of each pass so a resumed pass
  recovers the thread without re-deriving it.
- **When to read:** at CONTEXT, at the start of each pass.
- **When to write:** at ACT, as intermediate results land, so a later pass or a
  resumed session can recover the thread without re-deriving it.
- **Why distill, not dump.** Delegation is not only for parallelism: each subagent
  works in its own isolated context window and returns only a distilled result.
  That quarantines deep detail away from the orchestrator and protects its
  reasoning quality — which is why you distill what comes back, never dump it.

## TOOLS & SKILLS — choose & invoke capabilities

- **Direct tool vs. packaged skill vs. subagent.** Use a direct tool for cheap,
  local, single-step work you can do at your altitude. Reach for a packaged skill
  (a procedural capability available in the environment) when one already encodes
  the exact procedure you need — confirm it is present first. Delegate to a
  subagent when the work is deep, parallelizable, or needs its own focused context.
- **Match capability to altitude.** Orientation-level work stays with you;
  depth-level work goes to a specialist with the right capability.
- **Confirm availability before planning around it.** Do not architect a plan that
  depends on a capability you have not verified is present. If it is missing,
  re-plan rather than assume.

Security and governance — the pre-ACT gate, least privilege, and vetting
irreversible actions — is covered in `references/governance.md`. Consult it
before any state-changing step.
