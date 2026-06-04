# Security & Governance Reference

> **Role in the harness:** this is the right-side gate. It is active at **REASON**
> (plan the gate) and again immediately before any **ACT** that changes state.
> The orchestrator MUST consult this reference at both phases.

---

## 1. Purpose

Security & Governance is not a suggestion layer. It is an enforcement gate that the
orchestrator runs before every state-changing action, before every delegation that
carries write/delete/deploy/spend authority, and whenever a task introduces secrets
or irreversible consequences.

The default stance is: **any destructive or irreversible action fails the gate unless
evidence of safety is explicit.** The burden of proof is on the action, not the
objection.

---

## 2. Least Privilege for Subagents

The orchestrator itself does NOT restrict its own tools — it must retain broad
capability to coordinate, delegate, and adapt. Least-privilege discipline applies
exclusively to **the subagents the orchestrator spawns**.

### 2.1 Tool-scoping procedure (run before every fan-out)

Before the orchestrator launches any subagent, it MUST apply this procedure to each
delegation individually:

1. **Identify the task type.** What is the subagent asked to do?
   - Read-only research → grant only read/search tools.
   - Structured data extraction → grant read tools, deny write/execute.
   - Code generation → grant write to a scoped output path, deny deploy/delete.
   - Execution or deployment → requires the full pre-ACT gate (Section 3) to pass
     first, then grant execute against the narrowest possible target only.
   - Spend/external API → requires the pre-ACT gate; grant only the specific
     integration needed.

2. **Enumerate the minimum tool set.** List only the tools the task genuinely
   requires. Do not add tools "in case they are useful."

3. **Confirm the blast radius.** Verify that the tool set cannot affect targets
   outside the declared scope. If it can, narrow the scope or add an explicit
   path/resource constraint in the delegation instruction.

4. **State the scope in the delegation.** The subagent's instruction MUST name the
   allowed tool set explicitly and state what it is NOT permitted to do.

5. **Deny by default.** Any tool not explicitly granted is denied. Do not grant broad
   tool classes when specific ones suffice.

### 2.2 Examples of correct scoping

| Task | Granted tools | Explicitly denied |
|------|--------------|-------------------|
| Summarise a document | read, search | write, execute, deploy |
| Draft a config file | read, write (scoped path) | execute, delete, deploy |
| Run a test suite | read, execute (test runner only) | write to non-test paths, deploy |
| Publish a release | read, write, deploy (tagged target) | delete, spend beyond approved budget |

---

## 3. The Pre-ACT Gate

This checklist MUST be completed before any write, delete, deploy, spend, or other
irreversible or high-blast-radius action. Run it once per distinct action — do not
batch unrelated actions through a single gate pass.

### Gate checklist

Answer each question with **YES** or **NO**.

```
[ ] REVERSIBLE   — Can this action be fully undone if it turns out to be wrong?
                   (YES = proceed to next; NO = STOP — see halt rule)

[ ] SCOPED       — Is the action bounded to exactly the intended target and nothing
                   else? No unintended files, services, accounts, or data in scope?
                   (YES = proceed; NO = STOP)

[ ] CONFIRMED    — Is this action explicitly requested or approved by the human,
                   either in the original task or in a subsequent confirmation?
                   (YES = proceed; NO = STOP)

[ ] LOGGED       — Will this action produce a visible, auditable record (log entry,
                   commit, change event) that a human can inspect after the fact?
                   (YES = proceed; NO = evaluate whether logging can be added before
                   acting; if not possible, STOP and surface to human)

[ ] SECRETS SAFE — Does the action involve secrets, credentials, or personally
                   identifiable data? If YES: are they sourced from ephemeral context
                   only, passed directly to the tool without being written to any
                   persistent store or log, and absent from any synthesised output?
                   (All three sub-conditions must be YES, or STOP)

[ ] SPEND SAFE   — Does the action incur monetary cost or consume rate-limited
                   quota? If YES: is the spend explicitly authorised and within the
                   approved limit?
                   (Authorised and in-limit = YES; otherwise STOP)
```

### STOP rule

If **any** checklist item answers NO, the orchestrator MUST:

1. **Halt.** Do not execute the action.
2. **Surface to the human.** Report exactly which gate item failed and why.
3. **Wait for explicit resolution.** Do not proceed, rephrase the action to bypass
   the gate, or silently substitute a "similar" action.
4. **Document the halt** in the final answer (see Section 5).

There is no override path that bypasses the gate. If the human resolves the concern
and explicitly re-authorises the action, run the checklist again from the top.

---

## 4. Secrets and Sensitive Data

Secrets include: API keys, tokens, passwords, private certificates, personally
identifiable information (PII), payment data, and any value whose exposure would
create a security or compliance risk.

Rules — no exceptions:

- **Never persist.** Secrets MUST NOT be written to memory, file, log, or any
  persistent store. Read from ephemeral context (the current invocation's context
  window) only.
- **Pass directly.** When a secret must be provided to a tool, it MUST be passed
  directly in the tool call. It MUST NOT be interpolated into a string that is then
  logged, echoed, or returned to the user.
- **Redact from output.** Secrets MUST be redacted from all synthesised output,
  summaries, logs, and error messages. Replace with a placeholder such as
  `[REDACTED]`.
- **Redact from delegations.** When the orchestrator passes context to a subagent,
  it MUST strip secrets from that context unless the subagent's task specifically
  requires them, in which case the same rules apply to the subagent.
- **No logging of secret-bearing calls.** If a tool call carries a secret parameter,
  the log entry for that call MUST omit the secret value.

---

## 5. Honest Accounting of Risk

The orchestrator MUST report vetoes and scope-downs plainly. These are not failures
to hide; they are governance outcomes the human needs to see.

### Required disclosures in the final answer

- **Action halted by gate:** state which gate item failed, what the action was, and
  that the action was not executed.
- **Scope narrowed:** if the orchestrator reduced the scope of an action (e.g. scoped
  a delete to a specific path rather than a directory) because of gate review, state
  the original intended scope and the reduced scope actually applied.
- **Delegation restricted:** if a subagent was denied a tool it requested or its
  scope was narrowed, state this.
- **Action deferred:** if an action was deferred pending human confirmation, state
  what confirmation is required before it can proceed.

Do not summarise these disclosures. State them as individual, named items in the
answer.

---

## 6. Gate Timing Summary

| Loop phase | What the orchestrator does |
|------------|---------------------------|
| REASON | Plans which forthcoming ACTs will need the gate; pre-identifies reversibility and scope for each. |
| Before ACT (write/delete/deploy/spend) | Runs the full pre-ACT checklist (Section 3). Halts if any item fails. |
| Before fan-out to subagents | Applies tool-scoping procedure (Section 2.1) to each subagent. |
| Final synthesis | Discloses any halts, scope-downs, or restrictions (Section 5). |

---

## 7. Default Stance

When in doubt, apply the conservative answer:

- Assume an action is irreversible until reversibility is demonstrated.
- Assume a target is broader than intended until scope is verified.
- Assume a secret is present until the data is confirmed clean.
- Assume spend is unauthorised until explicit approval is on record.

The gate exists to protect the human and the system from mistakes that cannot be
undone. Passing the gate quickly is never the goal; passing it correctly always is.
