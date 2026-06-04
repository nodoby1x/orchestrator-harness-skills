# Harness Pillars — Depth

The loop (CONTEXT -> OBSERVE -> REASON -> ACT) is the engine. These five pillars
are what the loop reaches for at each phase. This file is self-contained: it
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

## MEMORY — persist state

- **What to persist:** the framed goal, the plan with current status, verified
  findings, and open gaps. Do NOT persist raw subagent transcripts — distill first.
- **When to read:** at CONTEXT, at the start of each pass.
- **When to write:** at ACT, as intermediate results land, so a later pass or a
  resumed session can recover the thread without re-deriving it.

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
