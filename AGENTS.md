# AGENTS.md — Al Ghassania School

## Core Rule

Solve exactly the requested task with the smallest necessary amount of context, computation, tool usage, and code changes.

Accuracy and task focus are more important than doing additional work.

---

## 1. Task Scope

- Focus strictly on the current user request.
- Do not expand the scope unless explicitly requested.
- Do not fix unrelated issues discovered during the task.
- If an unrelated issue blocks the requested task, report it briefly and stop.
- Do not add features, refactor code, or improve unrelated areas without a clear need.

## 2. Inspect Before Editing

Before making changes:

1. Identify only the files directly related to the task.
2. Read only the relevant sections of those files.
3. Inspect additional files only when required to understand dependencies or prevent an incorrect change.
4. Do not scan the entire project unless the task genuinely requires it.
5. Do not repeatedly search or reread information already available in the current context.

## 3. Minimal Context and Token Usage

- Minimize tool calls, file reads, searches, and command output.
- Prefer targeted searches over broad searches.
- Read only the smallest useful portion of a file.
- Never request or process large amounts of unrelated content.
- Do not repeat commands or investigations without a specific reason.
- Keep reasoning and user-facing explanations concise.
- Do not generate unnecessary documentation or verbose summaries.

## 4. Implementation

- Make the smallest safe change that fully solves the task.
- Prefer modifying existing code over creating new files or abstractions.
- Reuse existing components, utilities, types, patterns, and architecture.
- Do not introduce a new library, dependency, abstraction, or architectural pattern unless necessary.
- Preserve existing functionality outside the requested change.
- Do not rewrite entire files when a focused edit is sufficient.
- Do not change the data model or project architecture unless explicitly required.

## 5. Workflow

Follow this workflow for each task:

Review → Implement → Verify → Report

### Review
Determine:
- What the user wants.
- Which files are relevant.
- What the smallest required change is.

### Implement
- Make only the required changes.
- Keep changes focused and minimal.

### Verify
- Verify the changed functionality using the smallest appropriate check.
- Run build/tests only when useful or necessary.
- Do not repeatedly run expensive checks without reason.

### Report
Provide a very short report containing:
- Files changed.
- What was changed.
- Verification performed.
- Any blocker or important issue.

## 6. Existing Architecture

- Treat the existing project architecture as intentional.
- Follow existing conventions before introducing new ones.
- Reuse existing UI components and shared logic whenever possible.
- Do not duplicate functionality that already exists.
- Do not create a new solution when an existing project solution can be reused safely.

## 7. Skills

- Use a Skill only when it is directly relevant to the current task.
- Do not invoke or load Skills merely because they are installed.
- Use frontend-design for tasks that genuinely require UI/UX or visual design work.
- Use Superpowers when its methodology materially improves the requested development task.
- Do not use design or planning Skills for simple changes that do not need them.

## 8. Commands and Verification

- Prefer safe, targeted commands.
- Avoid commands that produce large unnecessary output.
- Do not run builds, tests, linting, or other expensive operations repeatedly.
- After a successful verification, do not repeat the same verification unless the code changes again or there is a specific reason.

## 9. Scope Protection

If you discover something outside the current task:

- Do not investigate it deeply.
- Do not modify it.
- Mention it briefly only if it affects the requested task.

Never allow an unrelated issue to turn the current task into a broader project refactor.

## 10. Ambiguity If the requested behavior is unclear and different interpretations could cause significant changes:

- Stop before making the risky change.
- Ask a concise clarification question.

If the ambiguity is minor and the existing project conventions clearly determine the correct behavior, follow those conventions.

## 11. Final Rule

Do not optimize for doing more work.

Optimize for solving the exact requested task correctly with:

- minimal context
- minimal token usage
- minimal tool usage
- minimal code changes
- minimal risk
- clear verification


Never read mockData.ts in full or thousands of lines unless the task explicitly requires it. Use grep/search to locate only the exact data definitions, types, helpers, or sections required for the current task.