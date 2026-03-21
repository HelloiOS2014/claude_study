# Advanced Claude Code Usage Patterns: Deep Research Report

> Compiled March 2026. Sources include Anthropic official docs, GitHub repos, blog posts, community guides, and power user reports.

---

## Table of Contents

1. [Prompt Engineering for Claude Code](#1-prompt-engineering-for-claude-code)
2. [Advanced Session Management](#2-advanced-session-management)
3. [Advanced Subagent Patterns](#3-advanced-subagent-patterns)
4. [Agent Teams Deep Patterns](#4-agent-teams-deep-patterns)
5. [Hooks Advanced Patterns](#5-hooks-advanced-patterns)
6. [Skills Authoring Deep Dive](#6-skills-authoring-deep-dive)
7. [MCP Server Advanced Usage](#7-mcp-server-advanced-usage)
8. [Workflow Methodologies](#8-workflow-methodologies)
9. [Cost Optimization and Monitoring](#9-cost-optimization-and-monitoring)
10. [Integration Patterns](#10-integration-patterns)

---

## 1. Prompt Engineering for Claude Code

### 1.1 Context Position and Its Effect on Behavior

Claude Code exhibits a well-documented **"Lost in the Middle" syndrome**. The model privileges both the beginning (primacy) and end (recency) of context, while instructions in the middle get diluted. Practical implications:

- **CLAUDE.md loads at session start** (primacy position) -- critical rules belong here
- **Repeat critical rules at the END** of long instructions to exploit recency bias
- **Mid-conversation instructions degrade** as context fills; after ~100K tokens, early architectural decisions can be summarized away
- **Single-turn interactions** for critical infrastructure tasks avoid multi-turn degradation entirely

The system prompt architecture follows a contract-style format. Claude Code interprets prompts as "contracts" with:
```
Role (1 line)
Success criteria (bullets)
Constraints (bullets)
Uncertainty handling rule
Output format specification
```

### 1.2 Words/Phrases with Special Weight

Based on system prompt analysis and community testing:

- **"IMPORTANT"**, **"CRITICAL"**, **"MUST"**, **"NEVER"** -- These carry enforcement weight in CLAUDE.md rules
- **"use proactively"** in subagent descriptions -- triggers automatic delegation rather than waiting
- **"ultrathink"** anywhere in skill content -- enables extended thinking mode
- **XML tags** (`<instructions>`, `<context>`, `<constraints>`) -- create semantic boundaries Claude interprets structurally, preventing "instruction leakage" where constraints are ignored during complex reasoning
- **"context: fork"** in skill frontmatter -- runs skill in isolated subagent context
- **"$ARGUMENTS"** -- string substitution variable in skills and commands

### 1.3 Structuring Multi-Step Instructions for Maximum Adherence

**Use XML tags as machine-readable protocol:**
```xml
<task>
  <context>Current codebase state and relevant files</context>
  <instructions>
    <step priority="1">Research the authentication module</step>
    <step priority="2">Identify security vulnerabilities</step>
    <step priority="3">Implement fixes following existing patterns</step>
  </instructions>
  <constraints>
    - Do not modify the database schema
    - All changes must have tests
    - Follow existing code style
  </constraints>
  <verification>Run the full test suite before declaring complete</verification>
</task>
```

**Key principles:**
- Compartmentalize directives using nested tags to prevent instruction leakage
- Describe the **end state** rather than micromanaging the path -- Claude Code does better when given room to figure out how to get there
- Include **explicit verification criteria** so the agent knows when it has actually finished
- For complex workflows, use **phase separation** (Research -> Plan -> Execute -> Review) to prevent context pollution

### 1.4 Token Efficiency Techniques

**The 60% context optimization stack** (combining all techniques):

1. **Skills-based progressive disclosure**: Load domain knowledge on-demand instead of all-at-once. ClaudeFast's Code Kit recovers ~15,000 tokens per session (82% improvement over loading everything into CLAUDE.md)
2. **Preprocessing hooks**: Instead of Claude reading a 10,000-line log file, a hook greps for ERROR and returns only matching lines (tens of thousands of tokens -> hundreds)
3. **`.claudeignore` file**: Exclude `node_modules/`, `build/`, `dist/`, generated files, logs -- reduces scanning and token expenditure
4. **Specific file paths in prompts**: "Fix the authentication error in src/login.ts at line 47" vs. "Something's broken somewhere" -- eliminates detective-work token costs
5. **Subagents for isolation**: Delegate verbose operations (test runs, log analysis) to subagents. Only the summary returns to main conversation
6. **Model selection per task**: Use Haiku for simple reads/exploration, Sonnet for implementation, Opus only for complex reasoning
7. **Token-efficient tool use**: Starting with Sonnet 3.7, tool calls save an average of 14% output tokens (up to 70%)
8. **Tool Search feature**: Dynamically loads only needed tool definitions. Cuts context from ~72K to ~8.7K tokens (85% reduction). Activates automatically when tool definitions exceed 10% of context window

### 1.5 Handling "Claude Forgetting" Mid-Session

**Root cause:** Context window saturation. Reading 10 files + 30-minute conversation can consume >100K tokens. Auto-compaction (triggers at ~83.5% / ~167K tokens) summarizes aggressively, losing granular details.

**Workarounds:**

| Strategy | How It Works |
|----------|-------------|
| **Targeted /compact** | `/compact preserve the coding patterns we established` -- guides summarization |
| **CLAUDE.md as anchor** | Critical rules survive compaction because they reload each turn |
| **Fresh session + spec** | Write spec in session 1; start session 2 with clean context focused on execution |
| **HANDOFF.md pattern** | Before ending session: "Write a HANDOFF.md summarizing progress, decisions, blockers, and next steps" |
| **PreCompact hooks** | Auto-backup transcript before compaction triggers |
| **Session checkpointing** | Snapshot JSONL files at `~/.claude/projects/[hash]/[session-id].jsonl` |
| **1M context models** | Use `sonnet[1m]` for 1M-token windows at no pricing premium (as of March 2026) |

---

## 2. Advanced Session Management

### 2.1 Long Session Strategies

**The 33K-45K Token Buffer Problem:**
- Claude Code reserves ~33K tokens (16.5% of 200K window) as an internal buffer -- you cannot use this space
- Previously this was ~45K tokens (22.5%) -- reduced in early 2026 (undocumented change)
- Compaction fires at ~167K tokens of actual usage
- **Quality degrades at 20-40% context usage** due to attention dilution, not token exhaustion

**Recommended cadence:**
- Target **60% context utilization** (well before the ~80% auto-compact threshold)
- Every **30-45 minutes** of active work or after every major milestone, run manual `/compact`
- `/clear` between unrelated tasks to fully reset context
- Monitor with custom StatusLine showing real-time token percentage

**Formula for actual free space:**
```
freeUntilCompact = max(0, remaining_percentage - 16.5)
```

### 2.2 Multi-Session Workflows

**Session continuation:**
- `claude -c` or `claude --continue` -- continue most recent conversation
- `claude -r "session_id"` or `claude --resume session_id` -- resume specific session

**The HANDOFF.md Pattern (from ykdojo's tips):**
Before ending a session, ask Claude to write a comprehensive handoff document:
```
Write a HANDOFF.md with:
- What was accomplished
- Key decisions made and why
- What didn't work (and why)
- Exact next steps
- File paths that matter
- Any gotchas for the next session
```

Start the next session with: "Read HANDOFF.md and continue from where we left off."

**Session memory** (for Pro/Max/Team/Enterprise): Automatic cross-session context that Claude maintains and references.

### 2.3 /compact Strategies

`/compact` accepts natural language instructions for what to preserve:
```
/compact preserve the API design decisions and the failing test patterns
/compact keep the database schema changes and the migration plan
/compact focus on the authentication refactor progress
```

**What survives compaction**: Code patterns, file states, key decisions, recent tool outputs.
**What gets lost**: Variable names, exact error messages, nuanced early-session context.

**Strategic manual compaction**: Disable autocompact and run `/compact` at intentional points (after major features), controlling what gets summarized.

`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` environment variable (1-100): shifts the trigger point. Lower values trigger earlier, preserving more buffer.

### 2.4 Checkpoint/Rewind System

**Access:** Press `Esc + Esc` or run `/rewind`

**What gets tracked:** Only direct file edits through Claude's editing tools (Write, Edit). Does NOT track:
- Bash commands (rm, mv, cp)
- Manual edits
- Changes from other concurrent sessions

**Three restore options:**
1. **Conversation + Code** -- full rewind to that point
2. **Conversation only** -- reset Claude's context while keeping current code
3. **Code only** -- revert files while preserving conversation history

**Design intent:** Quick session-level recovery, not a replacement for Git. Use Git for permanent version history.

### 2.5 Context Window Monitoring

- `/context` command -- shows current usage and warnings about excluded skills
- Custom StatusLine -- real-time display of model, directory, git branch, uncommitted files, sync status, and token usage percentage (supports 10 color themes)
- `claude-hud` plugin (github.com/jarrodwatts/claude-hud) -- real-time context usage in terminal
- `/usage` command -- session and weekly token totals (resets every 5 hours)

---

## 3. Advanced Subagent Patterns

### 3.1 Custom Subagent Definitions

Subagents are Markdown files with YAML frontmatter stored at:
- `.claude/agents/` -- project scope (priority 2)
- `~/.claude/agents/` -- user scope (priority 3)
- `--agents` CLI flag -- session scope (priority 1, highest)
- Plugin `agents/` directory -- lowest priority

**Complete frontmatter fields:**

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase + hyphens) |
| `description` | When to delegate (Claude uses this for automatic routing) |
| `tools` | Allowlist of available tools |
| `disallowedTools` | Denylist (applied first if both set) |
| `model` | `sonnet`, `opus`, `haiku`, full model ID, or `inherit` |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | Maximum agentic turns before stop |
| `skills` | Skills to preload into subagent context at startup |
| `mcpServers` | MCP servers available (inline definition or reference by name) |
| `hooks` | Lifecycle hooks scoped to this subagent |
| `memory` | Persistent memory scope: `user`, `project`, or `local` |
| `background` | `true` to always run as background task |
| `effort` | `low`, `medium`, `high`, `max` (Opus 4.6 only) |
| `isolation` | `worktree` for isolated git worktree copy |

**CLI-defined subagents (for automation/testing):**
```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

### 3.2 Memory Persistence Across Sessions

When `memory` is set, the subagent gets a persistent directory:

| Scope | Location |
|-------|----------|
| `user` | `~/.claude/agent-memory/<agent-name>/` |
| `project` | `.claude/agent-memory/<agent-name>/` |
| `local` | `.claude/agent-memory-local/<agent-name>/` |

The subagent's system prompt includes instructions for maintaining a `MEMORY.md` file (first 200 lines auto-loaded). Read, Write, and Edit tools are automatically enabled.

**Best practice**: Include in the subagent's prompt: "Update your agent memory as you discover codepaths, patterns, library locations, and key architectural decisions."

### 3.3 Subagent Chaining

Each subagent completes its task and returns results to Claude, which passes relevant context to the next:
```
Use the code-reviewer subagent to find performance issues,
then use the optimizer subagent to fix them
```

**Three-stage production pipeline pattern:**
1. **pm-spec agent** -- reads task input, writes structured spec with acceptance criteria
2. **architect-review agent** -- validates spec against platform constraints, produces decision record
3. **implementer-tester agent** -- writes code and tests, updates documentation

**Resuming subagents:** Each invocation gets an agent ID. Use `SendMessage` with the agent's ID to resume where it left off, retaining full conversation history.

**Parallel research:** Spawn multiple subagents for independent investigations:
```
Research the authentication, database, and API modules
in parallel using separate subagents
```

### 3.4 Model Selection Per Task

| Task Type | Recommended Model | Rationale |
|-----------|------------------|-----------|
| File search, code exploration | Haiku | Fast, cheap, read-only sufficient |
| Code implementation | Sonnet | Good balance of capability and speed |
| Complex architecture decisions | Opus | Best reasoning, worth the cost |
| Planning/research | Inherit from main | Consistency with main thread |

The built-in **Explore** subagent already uses Haiku with read-only tools. The **Plan** and **General-purpose** subagents inherit from the main conversation.

### 3.5 Subagent Tool Access Control

**Restrict which subagents can be spawned:**
```yaml
tools: Agent(worker, researcher), Read, Bash
```
Only `worker` and `researcher` can be spawned. All others are blocked.

**Scope MCP servers to specific subagents:**
```yaml
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github  # reference existing server
```
Inline definitions connect only when the subagent starts, avoiding context cost in the main conversation.

**Conditional validation with hooks:**
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
```

---

## 4. Agent Teams Deep Patterns

### 4.1 Architecture

Agent teams = one **team lead** + multiple **teammates**, each in separate Claude Code instances with independent context windows.

Enable via settings:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Key structural elements:**
- **Shared task list** with dependency tracking and auto-unblocking
- **File-lock based claiming** -- teammates self-claim the next available unblocked task
- **Inbox-based messaging** -- lead can message any teammate, teammates message each other directly

**Critical difference from subagents:** Agent teams enable **peer-to-peer communication**. Subagents only report back to a single parent. Teams create a fundamentally different coordination model.

### 4.2 Task Decomposition Strategies

- **5-6 tasks per teammate** prevents coordination overhead while maintaining productivity
- **File ownership boundaries** -- each teammate owns distinct files to avoid merge conflicts
- **Self-contained work units** with explicit success criteria
- Tasks with unresolved dependencies cannot be claimed until blocking tasks complete

**What works well:**
- Cross-layer features (frontend, backend, tests simultaneously)
- Research with competing approaches
- Parallel security/performance/test reviews

**What struggles:**
- Write-heavy tasks where multiple agents modify the same files
- Vague requests ("Build me an app") waste tokens as teams struggle

### 4.3 Inter-Agent Communication

- **Text output from teammates is NOT visible to the team** -- they MUST use write operations (files, task updates) to communicate
- Teammates can message the lead AND each other
- Checkpoints between work phases
- Graceful degradation when individual agents fail

**Competing hypotheses pattern:** Spawn multiple investigators exploring different theories simultaneously, allowing adversarial debate to eliminate anchoring bias faster.

### 4.4 Scaling to 10+ Agents

Claude Code supports up to 10 simultaneous subagents (2026). Key scaling considerations:

- **Token costs scale linearly** -- each teammate has its own context window
- **You are NOT getting work done cheaper** -- you are getting it done faster at the same or higher cost
- **Coordination overhead increases** with more agents
- **One team per session** (no nested teams, preventing runaway costs)
- No session resumption for in-process teammates

**Control mechanisms for large teams:**
- **Plan approval mode** -- read-only until lead approves
- **Delegate mode** -- restricts lead to coordination-only
- Structured task management with self-coordination
- Standardized spawn prompt templates for common configurations

### 4.5 Real-World Configurations

**9-agent parallel code review** (from HAMY labs):
1. Test Runner, 2. Linter/Static Analysis, 3. Code Reviewer, 4. Security Reviewer, 5. Quality/Style Reviewer, 6. Test Quality Reviewer, 7. Performance Reviewer, 8. Dependency/Deployment Safety, 9. Simplification/Maintainability

Each receives the same diff, operates independently, then the orchestrator synthesizes findings and produces a three-level verdict (Ready to Merge / Needs Attention / Needs Work). Reports ~75% useful feedback (up from <50% with single-agent).

**Anthropic's official Code Review plugin** (March 2026):
- 5 independent reviewers: CLAUDE.md compliance, bug detection, git history context, previous PR comments, code comment verification
- Findings scored 0-100 confidence; only high-confidence (>80) posted
- 54% of PRs receive substantive comments (up from 16%)
- Engineers marked <1% of findings as incorrect
- Cost: $15-$25 per review, ~20 minutes completion

---

## 5. Hooks Advanced Patterns

### 5.1 Four Hook Types

| Type | Description | Capabilities |
|------|-------------|-------------|
| **command** | Shell command receiving JSON via stdin | Exit codes control flow; stderr messages sent to Claude |
| **prompt** | Single-turn LLM evaluation | Returns yes/no decision as JSON; semantic evaluation |
| **agent** | Spawns full subagent with tool access | Up to 50 tool turns; can read files, grep, run commands |
| **http** | HTTP POST to a URL | Same JSON output format as command hooks |

### 5.2 All Lifecycle Events

| Event | Matcher Input | When It Fires |
|-------|--------------|---------------|
| `SessionStart` | (none) | Session begins |
| `UserPromptSubmit` | (none) | User submits a prompt |
| `PreToolUse` | Tool name | Before any tool call |
| `PostToolUse` | Tool name | After any tool call |
| `Notification` | (none) | Notification events |
| `Stop` | (none) | Claude finishes responding |
| `PreCompact` | (none) | Before context compaction |
| `SubagentStart` | Agent type name | Subagent begins execution |
| `SubagentStop` | Agent type name | Subagent completes |

### 5.3 Hook Chaining and Execution Order

Hooks execute in array order. When multiple hooks match the same event:
1. **Managed policies** run first (cannot be overridden)
2. **Global** hooks
3. **Project** hooks
4. **Plugin/skill** hooks

If any blocking hook outputs deny/block, the action is blocked.

### 5.4 Advanced Hook Patterns

**Self-verifying agent with Stop hook:**
A prompt hook evaluates whether all requested tasks were completed:
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Did the agent complete ALL requested tasks and run tests? Answer with {\"decision\": \"block\"} to continue working or {\"decision\": \"allow\"} to stop."
      }]
    }]
  }
}
```

**Context re-injection after compaction:**
```json
{
  "hooks": {
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "cat .claude/critical-context.md"
      }]
    }]
  }
}
```
The stdout output is added as context for Claude, preserving instructions that would otherwise be lost.

**PreToolUse security gate:**
Exit code 2 blocks the operation and sends stderr to Claude. Three outcomes: allow, deny, or ask (prompt user).
```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if echo "$COMMAND" | grep -iE '\b(rm -rf|DROP TABLE|force push)\b' > /dev/null; then
  echo "Blocked: Dangerous operation detected" >&2
  exit 2
fi
exit 0
```

**PreToolUse with input modification:**
PreToolUse can modify tool input before execution via `hookSpecificOutput`, enabling input sanitization.

### 5.5 Security Hooks

**Prompt injection defense:**
- `parry` by Dmytro Onypko -- scans tool inputs/outputs for injection attacks, secrets, and data exfiltration
- `lasso-security/claude-hooks` -- scans for instruction override attempts and encoded payloads

**Enterprise control:**
`allowManagedHooksOnly: true` blocks user, project, and plugin hooks entirely.

**Hook environment variables:**
- `CLAUDE_TOOL_INPUT` -- current tool input
- `CLAUDE_FILE_PATHS` -- affected file paths

---

## 6. Skills Authoring Deep Dive

### 6.1 Complete Frontmatter Reference

```yaml
---
name: my-skill                     # Display name, becomes /slash-command
description: What this does        # Claude uses this for auto-invocation
argument-hint: [issue-number]      # Shown during autocomplete
disable-model-invocation: true     # Prevent auto-loading; manual only
user-invocable: false              # Hide from / menu; Claude-only
allowed-tools: Read, Grep, Glob    # Restrict tool access
model: sonnet                      # Override model for this skill
effort: high                       # low, medium, high, max (Opus 4.6)
context: fork                      # Run in isolated subagent
agent: Explore                     # Which subagent when context: fork
hooks: ...                         # Scoped lifecycle hooks
---
```

### 6.2 Dynamic Context Injection

The `` !`<command>` `` syntax runs shell commands BEFORE Claude sees the skill content:
```yaml
---
name: pr-summary
context: fork
agent: Explore
---
## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

Summarize this pull request...
```

Commands execute immediately; output replaces the placeholder. Claude only sees the final rendered result.

### 6.3 String Substitution Variables

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing the SKILL.md |

### 6.4 Skills That Spawn Subagents

**`context: fork`** runs the skill in an isolated subagent:
```yaml
---
name: deep-research
context: fork
agent: Explore
---
Research $ARGUMENTS thoroughly...
```

The `agent` field specifies execution environment: built-in (`Explore`, `Plan`, `general-purpose`) or any custom subagent from `.claude/agents/`.

**Inverse pattern -- subagent with preloaded skills:**
```yaml
# In .claude/agents/api-developer.md
---
name: api-developer
skills:
  - api-conventions
  - error-handling-patterns
---
Implement API endpoints following preloaded skill patterns.
```

### 6.5 Bundled Skills (Ship with Claude Code)

| Skill | Purpose |
|-------|---------|
| `/batch <instruction>` | Parallel codebase changes across worktrees. Decomposes into 5-30 units, one agent per unit |
| `/claude-api` | Load Claude API reference for your language + Agent SDK |
| `/debug [description]` | Troubleshoot current session by reading debug log |
| `/loop [interval] <prompt>` | Run prompt repeatedly on schedule |
| `/simplify [focus]` | 3 parallel review agents for code quality, then apply fixes |

### 6.6 Invocation Control Matrix

| Frontmatter | User can invoke | Claude can invoke | Context behavior |
|-------------|----------------|-------------------|-----------------|
| (default) | Yes | Yes | Description always in context; full loads when invoked |
| `disable-model-invocation: true` | Yes | No | Description not in context |
| `user-invocable: false` | No | Yes | Description always in context |

### 6.7 Skill Character Budget

Skill descriptions are loaded into context. Budget scales at **2% of context window** with a fallback of 16,000 characters. Override with `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable. Check `/context` for warnings about excluded skills.

---

## 7. MCP Server Advanced Usage

### 7.1 Building Custom MCP Servers

MCP servers provide three capability types:
- **Resources** -- file-like data (read by clients)
- **Tools** -- functions callable by the LLM
- **Prompts** -- pre-written templates for specific tasks

**Quick setup in Claude Code:**
```bash
claude mcp add my-server -- npx -y my-mcp-package
```

Official SDKs exist for TypeScript and Python with Streamable HTTP for remote hosting.

**Custom workflow server example**: A server that automatically suggests PR templates based on changed files, monitors GitHub Actions runs, and provides project-specific tooling.

### 7.2 Multi-MCP Orchestration

Real-world multi-server setup enabling a full invoice platform in one day:
- **Claude Code** for file operations
- **GitHub MCP** for version control and git blame
- **Postgres MCP** for database operations
- **Figma MCP** for design assets
- **Jira/Atlassian MCP** for issue management

**Configuration hierarchy:**
- User scope (global): `~/.claude/mcp.json`
- Local scope (project-specific): `.claude/mcp.json` (not committed)
- Project scope (team-shared): `.mcp.json` in repository root

### 7.3 Performance Considerations

**Context cost of MCP servers:** Every server loads tool definitions into your context window.

**Tool Search optimization:** Activates automatically when definitions exceed 10% of context. Cuts consumption from ~72K to ~8.7K tokens (85% reduction). Requires Sonnet 4+ or Opus 4+.

**Critical: Adding one MCP tool changes the cache prefix**, invalidating the cache for the entire conversation history. Be deliberate about which servers are active.

### 7.4 Security Considerations

- **Principle of least privilege**: Specialized agents restricted to specific MCP tools
- **Inline MCP definitions in subagents** keep tools out of main conversation entirely
- **Elicitation**: MCP servers can request structured input from users mid-task
- **Import from Claude Desktop**: `claude mcp add-from-claude-desktop` for consistency
- `MAX_MCP_OUTPUT_TOKENS` environment variable controls response limits

---

## 8. Workflow Methodologies

### 8.1 The Ralph Wiggum Technique

**Origin:** Geoffrey Huntley. Named after the Simpsons character. Now an official Anthropic plugin.

**Core mechanism:** A Stop hook intercepts Claude's exit attempts and re-feeds the same prompt, creating an autonomous improvement loop.

**Setup:**
```bash
# Install plugin, then:
/ralph-loop "Build a REST API for todos. Requirements: CRUD, validation, tests.
Output <promise>COMPLETE</promise> when done." --completion-promise "COMPLETE" --max-iterations 50
```

**How it works internally:**
1. User invokes `/ralph-loop` with prompt
2. Claude works on the task
3. Claude tries to stop -> Stop hook blocks exit
4. Same prompt re-fed to Claude (but files on disk have changed)
5. Repeats until completion promise string detected OR max iterations hit

**Two-phase workflow:**
- **Phase 1 (Planning):** Generate spec through conversation, edit manually, create implementation plan
- **Phase 2 (Implementation):** Fresh context, feed only the plan, run Ralph loop

**Economics:** ~$10.42/hour with Sonnet. Enables overnight feature development.

**Real-world results reported:**
- 6 repositories generated overnight at Y Combinator hackathon
- $50K contract completed for $297 in API costs
- Entire programming language created over 3 months

**When to use:** Well-defined tasks with tests as verification. NOT for tasks requiring human judgment or unclear success criteria.

### 8.2 RIPER-5 Workflow

**Creator:** Tony Narlock. Five phases: Research, Innovate, Plan, Execute, Review.

**Architecture:** Three consolidated agents (not five) for context efficiency:
- **research-innovate agent** -- handles phases 1-2
- **plan-execute agent** -- handles phases 3-4
- **review agent** -- handles phase 5

**Key commands:**
- `/riper:strict` -- enable strict protocol enforcement
- `/riper:research [topic]` -- initiate code analysis
- `/riper:plan [feature]` -- create technical spec
- `/riper:execute [step]` -- implement (optionally specific substep)
- `/riper:review` -- validate against plan
- `/riper:workflow` -- guided full workflow with approval gates

**Memory bank system:**
```
.claude/memory-bank/
  main/
    plans/
    reviews/
    sessions/
  [feature-branch]/
```

**Phase capability matrix:**

| Mode | Read | Write | Execute | Plan | Validate |
|------|------|-------|---------|------|----------|
| RESEARCH | Yes | No | No | No | No |
| PLAN | Yes | Memory only | No | Yes | No |
| EXECUTE | Yes | Yes | Yes | No | No |
| REVIEW | Yes | Memory only | Tests only | No | Yes |

### 8.3 The Writer/Reviewer Pattern

**Anthropic's official implementation (Code Review plugin, March 2026):**

Five independent reviewers analyze changes in parallel:
1. CLAUDE.md compliance checking
2. Bug detection
3. Git history context analysis
4. Previous PR comment review
5. Code comment verification

Each finding scored 0-100 confidence. Only >80 threshold posted. Result: 54% of PRs get substantive comments (up from 16%), <1% marked incorrect.

**DIY version with subagents:**
```
After completing implementation:
1. Spawn a background subagent to review all changed files
2. Run the full test suite
3. Check for regressions
4. Report any issues found
```

### 8.4 The AB Method

**Creator:** Ayoub Bensalah. A spec-driven workflow transforming large problems into focused, incremental missions.

Core principle: Transform large problems into focused, incremental missions using Claude Code's specialized subagents. Emphasizes specifications as the anchor that prevents drift across iterations.

### 8.5 Boris Tane's Disciplined Workflow

Key insight: Rather than treating Claude as a sidebar tool, default to Claude-first interaction and "only peek at code when reviewing changes." Use Cursor for quick Command+K completions, Claude Code for everything else.

---

## 9. Cost Optimization and Monitoring

### 9.1 Token Usage Patterns and Benchmarks

**Average cost:** ~$6/developer/day with API pricing. 90% of users spend under $12/day.
**Monthly range:** $100-$200/developer (Sonnet). Opus/multi-agent workflows significantly higher.

**Token composition (typical session):**
- **90%+ cache reads** (cheapest)
- ~6% cache writes
- <1% actual input + output tokens

**Subscription vs API breakeven:**
- API >$100/month -> Max 5x saves money
- API >$200/month -> Max 20x tier makes sense
- Pro ($20/month): ~45 messages per 5-hour window
- Max plans: 5-hour rolling window with weekly limits

### 9.2 Per-Operation Cost Reference

| Model | Input | Output | Cache Write | Cache Read |
|-------|-------|--------|-------------|------------|
| Opus | $5/MTok | $25/MTok | $6.25/MTok | $0.50/MTok |
| Sonnet | $3/MTok | $15/MTok | $3.75/MTok | $0.30/MTok |
| Haiku | $1/MTok | $5/MTok | $1.25/MTok | $0.10/MTok |

**Ralph Wiggum autonomous execution:** ~$10.42/hour (Sonnet)

### 9.3 Budget Management Strategies

**Monitoring tools:**
- `/cost` command (API users)
- `/usage` command (all users)
- ccusage.com -- daily/weekly/monthly analysis with session grouping
- Anthropic Console Usage API
- Grafana dashboards via OpenTelemetry + Prometheus
- claude-hud plugin for real-time terminal display

**Cost reduction stack (cumulative ~60% savings):**
1. Model selection per task (Haiku for exploration)
2. Skills-based progressive disclosure
3. Preprocessing hooks for log/data filtering
4. `.claudeignore` for irrelevant files
5. Specific prompts with file paths
6. Subagent delegation for verbose operations
7. `/clear` between unrelated tasks
8. Strategic `/compact` at 50% context
9. Headless mode (`claude --print`) for automation
10. Prompt caching (automatic -- 90% savings on repeated content)
11. Batch requests for related queries
12. 1M context models (avoid compaction costs)

### 9.4 Caching Strategies

**Automatic prompt caching:** System prompts, tool definitions, and conversation history cached automatically. Cache reads cost 10% of normal input price.

**Cache invalidation gotcha:** Adding one MCP tool changes the prefix hash, invalidating cache for the entire conversation. Be deliberate about active MCP servers.

**Batch API processing:** Combine related queries into fewer calls. Up to 50% cost reduction for batch-eligible workloads.

---

## 10. Integration Patterns

### 10.1 GitHub Actions with Claude Code

**Official action:** `anthropics/claude-code-action@v1`

**Setup methods:**
- Quick: Run `/install-github-app` inside Claude Code
- Manual: Configure workflow YAML + secrets

**Real configuration -- automated PR review:**
```yaml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review this PR for:
            1. Security vulnerabilities
            2. Performance issues
            3. Code style violations
            4. Missing tests
          claude_args: |
            --max-turns 10
            --model claude-sonnet-4-6
```

**Real configuration -- flaky test detection with structured output:**
```yaml
- name: Detect flaky tests
  id: analyze
  uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: |
      Check CI logs. Return: is_flaky (boolean), confidence (0-1), summary (string)
    claude_args: |
      --json-schema '{"type":"object","properties":{"is_flaky":{"type":"boolean"},"confidence":{"type":"number"},"summary":{"type":"string"}}}'

- name: Retry if flaky
  if: fromJSON(steps.analyze.outputs.structured_output).is_flaky == true
  run: gh workflow run CI
```

**Key inputs:** `trigger_phrase`, `assignee_trigger`, `label_trigger`, `track_progress`, `plugins`, `settings`, `use_commit_signing`, `allowed_bots`.

### 10.2 Claude Code + Cursor/Copilot Side by Side

**Recommended hybrid approach (Steve Sewell / builder.io):**
- **Claude Code** as primary: all implementation, architecture, multi-file changes, debugging
- **Cursor** for: quick Command+K inline completions, tab completions, small edits
- **Copilot agent sidebars**: only when Claude is unavailable

**DevContainer dual-window setup:**
- Window 1: Claude Code running inside container (isolated execution)
- Window 2: Cursor on host machine (editing, browsing)
- Toggle between IDEs as needed

### 10.3 Claude Code in Docker/Containers

**Official reference devcontainer:** Preconfigured with VS Code Dev Containers extension.

**Security architecture:**
- **Firewall**: Outbound connections restricted to whitelisted domains (npm, GitHub, Claude API)
- **Filesystem isolation**: Only explicitly mounted paths accessible
- **NEVER mount Docker socket** into the container (agent could escape sandbox)
- Safe to run `--dangerously-skip-permissions` inside devcontainer for unattended operation

**Trail of Bits devcontainer** (github.com/trailofbits/claude-code-devcontainer): Purpose-built for security audits and untrusted code review.

**Deployment options:**
| Approach | Best For |
|----------|---------|
| Plain Docker sandbox | Most tasks, safest |
| Docker Compose | When Claude needs running services (DB, API) |
| DevContainers | Team-wide standardized environments |

### 10.4 Claude Code in Monorepos

**Hierarchical CLAUDE.md:**
```
monorepo/
  CLAUDE.md                    # Shared: CI, tooling, deployment
  packages/
    api/
      CLAUDE.md                # API-specific: endpoints, DB schema
    frontend/
      CLAUDE.md                # Frontend-specific: components, routing
      .claude/skills/          # Package-specific skills
    shared/
      CLAUDE.md                # Shared libraries: types, utils
```

**Load order:** Global -> Project root -> Subdirectory -> User-specific (later files take precedence).

**Context merging:** All levels contribute simultaneously. Files from working directory and above load at launch; subdirectories load as you work in them.

**Skills auto-discovery:** When editing files in `packages/frontend/`, Claude Code automatically discovers skills from `packages/frontend/.claude/skills/`.

**`--add-dir` for cross-package work:**
```bash
claude --add-dir ../shared --add-dir ../api
```
Skills from added directories are loaded and support live change detection.

### 10.5 Voice Input + Claude Code

**Native Voice Mode** (announced March 3, 2026): Available on Pro/Max/Team/Enterprise at no additional cost. Built directly into Claude Code.

**Third-party options:**
- **SuperWhisper**: Local voice model, works offline, integrates seamlessly with terminal
- **Aqua Voice / Wispr Flow**: Better programming term accuracy than native
- **VS Code Speech**: For sensitive codebases requiring offline processing
- **Parakeet v2/v3**: Local models, usable anywhere (even on planes)

**Recommended approach:** Try native Voice Mode first. If programming term accuracy is unsatisfactory, move to Aqua Voice or Wispr Flow.

---

## Appendix: Key Environment Variables

| Variable | Effect |
|----------|--------|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Override auto-compaction trigger percentage (1-100) |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Per-response generation limit (default 32K) |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Set to 1 to disable all background tasks |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Set to 1 to enable agent teams |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Override skill description character budget |
| `MAX_MCP_OUTPUT_TOKENS` | Increase MCP server response limits |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | Set to 1 to load CLAUDE.md from --add-dir paths |

## Appendix: Key File Paths

| Path | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Global personal instructions |
| `~/.claude/agents/` | User-scope subagents |
| `~/.claude/skills/` | User-scope skills |
| `~/.claude/agent-memory/` | User-scope agent memory |
| `.claude/agents/` | Project-scope subagents |
| `.claude/skills/` | Project-scope skills |
| `.claude/memory-bank/` | RIPER workflow memory |
| `.claude/agent-memory/` | Project-scope agent memory |
| `~/.claude/projects/[hash]/[session].jsonl` | Session transcripts |
| `.mcp.json` | Project MCP server config (committed) |
| `.claude/mcp.json` | Local MCP server config (not committed) |

---

## Sources

- [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code Official Docs: Best Practices](https://code.claude.com/docs/en/best-practices)
- [Claude Code Docs: Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Docs: Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Docs: Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Docs: Costs](https://code.claude.com/docs/en/costs)
- [Claude Code Docs: Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code Docs: GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code Docs: DevContainers](https://code.claude.com/docs/en/devcontainer)
- [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)
- [ykdojo/claude-code-tips (45 tips GitHub repo)](https://github.com/ykdojo/claude-code-tips)
- [32 Claude Code Tips: From Basics to Advanced (Agentic Coding Substack)](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [Addy Osmani: Claude Code Agent Teams / Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [HAMY: 9 Parallel AI Agents That Review My Code](https://hamy.xyz/blog/2026-02_code-reviews-claude-subagents)
- [Ralph Wiggum Plugin (Anthropic official)](https://github.com/anthropics/claude-code/blob/main/plugins/ralph-wiggum/README.md)
- [ClaudeFast: Context Buffer Management](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [ClaudeFast: Ralph Wiggum Technique](https://claudefa.st/blog/guide/mechanics/ralph-wiggum-technique)
- [RIPER-5 Workflow (Tony Narlock)](https://github.com/tony/claude-code-riper-5)
- [Anthropic Code Review Plugin](https://claude.com/blog/code-review)
- [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)
- [anthropics/skills (Community skills repo)](https://github.com/anthropics/skills)
- [FlorianBruniaux/claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)
- [Docker: Run Claude Code with Docker](https://www.docker.com/blog/run-claude-code-with-docker/)
- [Trail of Bits Claude Code DevContainer](https://github.com/trailofbits/claude-code-devcontainer)
- [Builder.io: How I Use Claude Code](https://www.builder.io/blog/claude-code)
- [ccusage.com (Token monitoring tool)](https://ccusage.com/)
- [12 Token-Saving Techniques (Aslam Doctor)](https://aslamdoctor.com/12-proven-techniques-to-save-tokens-in-claude-code/)
- [Dev.to: Ultimate Claude Code Guide](https://dev.to/holasoymalva/the-ultimate-claude-code-guide-every-hidden-trick-hack-and-power-feature-you-need-to-know-2l45)
- [Mikhail Shilkov: Inside Claude Code Skills](https://mikhail.io/2025/10/claude-code-skills/)
- [Prompt Caching Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
