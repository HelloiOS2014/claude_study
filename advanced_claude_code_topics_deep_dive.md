# Advanced Claude Code Topics: Deep Research Report

> Compiled March 2026. Based on official documentation, SDK repositories, community implementations, and real-world usage reports.

---

## Table of Contents

1. [Building Custom MCP Servers for Claude Code](#1-building-custom-mcp-servers-for-claude-code)
2. [Claude Code Plugin System](#2-claude-code-plugin-system)
3. [Debugging Claude Code Itself](#3-debugging-claude-code-itself)
4. [Monorepo and Multi-Repo Strategies](#4-monorepo-and-multi-repo-strategies)
5. [Performance Optimization](#5-performance-optimization)
6. [Claude Code SDK/API for Building Tools ON TOP of Claude Code](#6-claude-code-sdkapi-for-building-tools-on-top-of-claude-code)

---

## 1. Building Custom MCP Servers for Claude Code

### 1.1 What Is the MCP SDK?

The Model Context Protocol (MCP) is an open standard for connecting AI agents to external tools and data sources. MCP servers expose three capability types:

- **Resources**: File-like data readable by clients (API responses, file contents)
- **Tools**: Functions callable by the LLM (with user approval)
- **Prompts**: Pre-written templates for specific tasks

Official SDKs exist in two languages:
- **TypeScript**: `@modelcontextprotocol/sdk` ([npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk))
- **Python**: `mcp[cli]` ([PyPI](https://pypi.org/project/mcp/))

Additionally, FastMCP (`punkpeye/fastmcp` on GitHub) provides a higher-level TypeScript framework that simplifies server creation.

### 1.2 Creating an MCP Server from Scratch

#### Python (using FastMCP)

```bash
# Setup
uv init my-server && cd my-server
uv venv && source .venv/bin/activate
uv add "mcp[cli]" httpx
```

```python
# my_server.py
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
async def query_database(sql: str) -> str:
    """Execute a read-only SQL query against the database.

    Args:
        sql: The SQL query to execute (SELECT only)
    """
    if not sql.strip().upper().startswith("SELECT"):
        return "Error: Only SELECT queries are allowed"
    # ... execute query ...
    return result

@mcp.tool()
async def search_api(query: str, limit: int = 10) -> str:
    """Search the external API for results.

    Args:
        query: Search term
        limit: Maximum results to return
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.example.com/search",
                                     params={"q": query, "limit": limit})
        return response.text

def main():
    mcp.run(transport="stdio")

if __name__ == "__main__":
    main()
```

Key point: FastMCP uses Python type hints and docstrings to *automatically generate* tool definitions. No manual schema writing required.

#### TypeScript (using official SDK)

```bash
mkdir my-server && cd my-server
npm init -y
npm install @modelcontextprotocol/sdk zod@3
npm install -D @types/node typescript
```

```typescript
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-server",
  version: "1.0.0",
});

server.registerTool(
  "query_database",
  {
    description: "Execute a read-only SQL query",
    inputSchema: {
      sql: z.string().describe("SQL SELECT query to execute"),
    },
  },
  async ({ sql }) => {
    // ... execute query ...
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

### 1.3 stdio vs SSE vs Streamable HTTP Transport

| Transport | Latency | Remote Access | Multi-Client | Best For |
|-----------|---------|---------------|--------------|----------|
| **stdio** | <1ms | No | No | Local CLI tools, Claude Code integration |
| **Streamable HTTP** | 10-50ms | Yes | Yes | Web/cloud deployments, production |
| **SSE** (deprecated) | Higher | Yes | Yes | Legacy systems only |

#### stdio implementation

The default and simplest transport. Claude Code spawns the server as a subprocess and exchanges JSON-RPC messages through stdin/stdout pipes.

**Critical rule**: Never use `console.log()` (TypeScript) or `print()` (Python) in stdio servers -- stdout is reserved exclusively for JSON-RPC protocol messages. Any stray output corrupts the communication stream. Use `console.error()` or `logging.info()` (which defaults to stderr).

```python
# Python -- stdio
mcp.run(transport="stdio")
```

```typescript
// TypeScript -- stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Streamable HTTP implementation

Recommended for production/remote deployments. Single-endpoint HTTP design supporting both immediate responses and SSE streaming:

```typescript
// TypeScript -- Streamable HTTP
app.post('/mcp', async (req, res) => {
  const response = await server.handleRequest(req.body);
  if (!requiresStreaming(response)) {
    return res.json(response);
  }
  res.setHeader('Content-Type', 'text/event-stream');
  for await (const message of response.stream) {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  }
});
```

```python
# Python -- Streamable HTTP
mcp.run(transport="streamable-http", host="0.0.0.0", port=8080)
```

#### SSE (deprecated)

The dual-endpoint SSE architecture complicated session management and error handling. Use Streamable HTTP instead. SSE is maintained only for backward compatibility.

### 1.4 Registering MCP Servers in Claude Code

Three configuration scopes:

```bash
# Quick command-line registration (user scope)
claude mcp add my-server -- npx -y my-mcp-package

# Import from Claude Desktop
claude mcp add-from-claude-desktop
```

Configuration files:

| Scope | File | Committed? |
|-------|------|-----------|
| Project (team-shared) | `.mcp.json` in repo root | Yes |
| Local (personal) | `.claude/mcp.json` | No |
| User (global) | `~/.claude/mcp.json` | N/A |

Example `.mcp.json`:
```json
{
  "mcpServers": {
    "my-database": {
      "command": "node",
      "args": ["./mcp-servers/db-server/build/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    }
  }
}
```

### 1.5 Real Examples of Custom MCP Servers

#### Database MCP Server

The official `@modelcontextprotocol/server-sqlite` demonstrates database integration: enables LLMs to explore and query SQLite databases with built-in safety features and query validation.

Common pattern: Expose `list_tables`, `describe_table`, `query` (SELECT-only), and `execute` (with approval gates) tools. The server validates SQL, enforces read-only for exploration, and requires explicit permission for mutations.

#### API Wrapper MCP Server

GitHub's official MCP server (`github/github-mcp-server`) connects AI tools to GitHub's platform: read repos, manage issues/PRs, analyze code, automate workflows.

AWS provides `awslabs/mcp` with MCP servers for S3, DynamoDB, Lambda, and other services.

The pattern: Wrap existing REST APIs as MCP tools with Zod/Pydantic schemas for input validation. Handle authentication in the server process, expose clean tool interfaces to the LLM.

#### Filesystem MCP Server

`cyanheads/filesystem-mcp-server`: Platform-agnostic file operations including advanced search/replace, directory tree traversal. Supports both stdio and HTTP transports. Exposes tools for read, write, move, copy, search, and replace across configurable access-controlled directories.

#### Real-world multi-MCP orchestration

A documented case built an entire invoice platform in one day using:
- Claude Code for file operations
- GitHub MCP for version control and git blame
- Postgres MCP for database operations
- Figma MCP for design assets
- Jira MCP for issue management

### 1.6 Testing MCP Servers Locally

#### MCP Inspector

The official visual testing tool:

```bash
# Launch inspector with your server
npx @modelcontextprotocol/inspector node build/index.js

# With verbose debugging
DEBUG=true npx @modelcontextprotocol/inspector node build/index.js
```

Opens at `http://localhost:6274` with:
- Interactive tool testing UI
- Resource and prompt exploration
- Raw JSON-RPC message viewer (Messages panel)
- Export buttons for Claude Code, Cursor, and CLI configurations

#### Claude Code's --mcp-debug flag

```bash
claude --mcp-debug
```

Shows MCP server initialization, connection handshakes, and tool registration in the terminal.

#### Unit testing pattern

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("my MCP server", () => {
  it("should return results for valid query", async () => {
    const server = createMyServer();
    const result = await server.callTool("query_database", {
      sql: "SELECT * FROM users LIMIT 1"
    });
    expect(result.content[0].text).toContain("users");
  });
});
```

### 1.7 Performance Considerations

**Context cost**: Every MCP server loads tool definitions into your context window. Adding servers consumes tokens even before any tool is called.

**Tool Search optimization**: Activates automatically when definitions exceed 10% of context. Reduces consumption from ~72K to ~8.7K tokens (85% reduction). Requires Sonnet 4+ or Opus 4+.

**Cache invalidation gotcha**: Adding one MCP tool changes the cache prefix hash, invalidating the prompt cache for the entire conversation history. Be deliberate about which servers are active.

**`MAX_MCP_OUTPUT_TOKENS` environment variable**: Controls maximum response size from MCP servers. Increase for servers returning large payloads.

**Inline MCP definitions in subagents**: Keep tools out of the main conversation entirely by scoping MCP servers to specific subagents:

```yaml
# .claude/agents/db-worker.md
---
name: db-worker
mcpServers:
  - postgres:
      type: stdio
      command: npx
      args: ["-y", "@mcp/postgres-server"]
---
```

### 1.8 Security Best Practices

1. **Principle of least privilege**: Restrict each server to the minimum necessary capabilities. Use read-only access in production; gate writes behind human approval.

2. **Input validation**: Sanitize all inputs. Strip control characters, validate data types, reject oversized payloads. Use allowlists for structured fields, not denylists.

3. **Authentication for HTTP transport**: Validate Origin headers, enforce OAuth-based auth, implement rate limiting at user/session/tool levels.

4. **Token isolation**: MCP servers MUST NOT accept tokens not explicitly issued for them. Use dedicated authorization servers (OAuth Resource Server pattern from the June 2025 spec revision).

5. **Rate limiting**: Throttle failed auth attempts, code redemption failures, and per-tool call rates.

6. **Stdio security**: Inherently more secure -- no network exposure. But the server runs with the same permissions as the Claude Code process, so avoid giving it access to secrets it does not need.

7. **Production deployment**: Regular audits, patch management, prompt-injection safeguards. The available toolset should change between development and production -- production agents get read-only access with write operations gated behind approval.

---

## 2. Claude Code Plugin System

### 2.1 Plugin vs Skill vs Command -- What's the Difference?

| Concept | What It Is | Scope |
|---------|-----------|-------|
| **Plugin** | A self-contained directory bundling skills, agents, hooks, MCP servers, and LSP servers. Namespaced (`/plugin-name:skill`). Distributable via marketplaces. | Cross-project, team-shareable |
| **Skill** | A markdown file (SKILL.md) with optional frontmatter that provides instructions to Claude. Can be model-invoked (automatic) or user-invoked (slash command). | Per-project or per-plugin |
| **Command** | Legacy term for skills in `commands/` directory. Simple markdown files without the SKILL.md subfolder structure. | Per-project or per-plugin |
| **Agent/Subagent** | A markdown file defining a specialized Claude Code instance with its own model, tools, and permissions. | Per-project or per-plugin |

Decision guide:
- **Standalone `.claude/` directory**: Personal workflows, project-specific customizations, short skill names like `/deploy`
- **Plugin**: Sharing with teammates, distributing to community, versioned releases, reusable across projects (namespaced names like `/my-plugin:deploy`)

### 2.2 Plugin Directory Structure and Manifest

#### Complete directory layout

```
enterprise-plugin/
  .claude-plugin/              # Metadata directory (optional)
    plugin.json                  # Plugin manifest -- ONLY this goes here
  commands/                    # Legacy skill location (markdown files)
    status.md
  agents/                      # Subagent definitions
    security-reviewer.md
    performance-tester.md
  skills/                      # Agent Skills (preferred for new skills)
    code-reviewer/
      SKILL.md
    pdf-processor/
      SKILL.md
      scripts/
  hooks/                       # Event handlers
    hooks.json                   # Main hook config
  settings.json                # Default settings for the plugin
  .mcp.json                    # MCP server definitions
  .lsp.json                    # LSP server configurations
  scripts/                     # Hook and utility scripts
    security-scan.sh
    format-code.py
  LICENSE
  CHANGELOG.md
```

**Critical rule**: Never put `commands/`, `agents/`, `skills/`, or `hooks/` inside `.claude-plugin/`. Only `plugin.json` goes inside `.claude-plugin/`.

#### Complete manifest schema (plugin.json)

```json
{
  "name": "plugin-name",           // Required. Kebab-case. Used as namespace prefix.
  "version": "2.1.0",             // Semantic versioning
  "description": "Brief description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "commands": ["./custom/commands/special.md"],  // string | array
  "agents": "./custom/agents/",                  // string | array
  "skills": "./custom/skills/",                  // string | array
  "hooks": "./config/hooks.json",                // string | array | object
  "mcpServers": "./mcp-config.json",             // string | array | object
  "outputStyles": "./styles/",                   // string | array
  "lspServers": "./.lsp.json"                    // string | array | object
}
```

Custom paths supplement default directories -- they do not replace them. If both `commands/` and a custom commands path exist, both are loaded.

#### Environment variables available in plugins

- `${CLAUDE_PLUGIN_ROOT}`: Absolute path to plugin installation directory. Changes on update.
- `${CLAUDE_PLUGIN_DATA}`: Persistent directory for plugin state (`~/.claude/plugins/data/{id}/`). Survives updates. Auto-created on first reference. Deleted when plugin is uninstalled (unless `--keep-data`).

### 2.3 Creating and Distributing Plugins

#### Quickstart

```bash
# 1. Create structure
mkdir -p my-plugin/.claude-plugin my-plugin/skills/hello

# 2. Create manifest
cat > my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "description": "Example plugin",
  "version": "1.0.0"
}
EOF

# 3. Create a skill
cat > my-plugin/skills/hello/SKILL.md << 'EOF'
---
description: Greet the user warmly
disable-model-invocation: true
---
Greet the user named "$ARGUMENTS" and ask how you can help.
EOF

# 4. Test locally
claude --plugin-dir ./my-plugin
# Then type: /my-plugin:hello World
```

#### Distribution methods

1. **Official Anthropic Marketplace**: Submit via `claude.ai/settings/plugins/submit` or `platform.claude.com/plugins/submit`
2. **Custom team marketplace**: A JSON file listing plugins with source locations (git repos, local paths, package managers)
3. **Direct sharing**: Share the plugin directory; others load with `--plugin-dir`

#### CLI commands for plugin management

```bash
claude plugin install formatter@my-marketplace        # Install
claude plugin install formatter --scope project       # Install to project scope
claude plugin uninstall formatter                      # Remove
claude plugin enable formatter                         # Enable disabled plugin
claude plugin disable formatter                        # Disable without removing
claude plugin update formatter                         # Update to latest
claude plugin validate                                 # Validate manifest
```

#### Installation scopes

| Scope | Settings File | Use Case |
|-------|--------------|----------|
| `user` | `~/.claude/settings.json` | Personal plugins, all projects (default) |
| `project` | `.claude/settings.json` | Team plugins, version controlled |
| `local` | `.claude/settings.local.json` | Project-specific, gitignored |
| `managed` | Managed settings (MDM/server) | Org-enforced plugins (read-only) |

### 2.4 Notable Community Plugins (as of March 2026)

Over 9,000 plugins exist across ClaudePluginHub, Claude-Plugins.dev, and Anthropic's official marketplace.

| Plugin | Description |
|--------|-------------|
| **claude-hud** (`jarrodwatts/claude-hud`) | Real-time context usage, active tools, running agents, and todo progress display |
| **claude-code-safety-net** | Catches destructive git and filesystem commands before execution |
| **ralph-wiggum** (official Anthropic) | Autonomous coding loops -- keeps Claude working until a completion promise is detected |
| **context7** | Provides real-time, up-to-date library documentation to reduce hallucinations |
| **claude-code-unified-agents** (722+ stars) | Comprehensive collection of specialized subagents |
| **superpowers** | Lifecycle management + skill framework for structured dev workflows |
| **local-review** | 5-agent parallel code review on uncommitted changes |
| **agent-peer-review** | Cross-model review between Claude and Codex with escalation |
| **dev-browser** (`SawyerHood/dev-browser`) | Lightweight browser testing, lower context than Playwright MCP |
| **typescript-lsp** / **rust-lsp** / **pyright-lsp** (official) | Real type checking via Language Server Protocol |
| **plannotator** | Structured, annotated plans with review/sharing UI |
| **shipyard** | Infrastructure-as-code validation + security auditing for enterprise |
| **claude-mem** | Cross-session memory with SQLite + ChromaDB vector embeddings |

### 2.5 Plugin Hooks, Skills, and Agents Integration

#### Hooks in plugins

Hooks live in `hooks/hooks.json` (auto-discovered) with the same format as user hooks:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
        }]
      }
    ]
  }
}
```

Available lifecycle events (complete list as of March 2026): `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, `Notification`, `SubagentStart`, `SubagentStop`, `Stop`, `StopFailure`, `TeammateIdle`, `TaskCompleted`, `InstructionsLoaded`, `ConfigChange`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `SessionEnd`.

Four hook types: `command` (shell), `http` (POST to URL), `prompt` (LLM evaluation), `agent` (full subagent with tools).

#### Settings.json in plugins

Plugins can ship default settings. Currently only the `agent` key is supported, which activates one of the plugin's custom agents as the main thread:

```json
{
  "agent": "security-reviewer"
}
```

#### LSP servers in plugins

Plugins can provide code intelligence via `.lsp.json`:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": { ".go": "go" }
  }
}
```

Users must install the language server binary separately. The plugin only configures how Claude Code connects to it.

---

## 3. Debugging Claude Code Itself

### 3.1 When Claude Code Behaves Unexpectedly

Start with these diagnostic steps in order:

1. **Run `/doctor`** -- comprehensive built-in diagnostics
2. **Check version**: `claude --version` -- ensure you're on the latest
3. **Try `/debug`** -- reads your session's debug log and explains what went wrong
4. **Enable verbose logging**: `claude --verbose`
5. **For MCP issues**: `claude --mcp-debug`

### 3.2 /doctor Command Details

`/doctor` performs comprehensive diagnostics and checks:

- Installation type, version, and search functionality
- Auto-update status and available versions
- Invalid settings files (malformed JSON, incorrect types)
- MCP server configuration errors
- Keybinding configuration problems
- Context usage warnings (large CLAUDE.md files, high MCP token usage, unreachable permission rules)
- Plugin and agent loading errors
- API key presence and format validation

You can also run it from the command line: `claude doctor`

### 3.3 /debug Command

Introduced in Claude Code v2.1.30, `/debug` is a built-in skill that reads your session's debug logs and troubleshoots the current session. It can identify:

- Why a skill did not run
- Why a tool call failed
- MCP server connection issues
- Hook execution failures

### 3.4 Common Issues and Solutions

| Issue | Solution |
|-------|---------|
| `command not found: claude` | Fix PATH -- add `~/.local/bin` to shell profile |
| Repeated permission prompts | Use `/permissions` to allowlist specific tools |
| Authentication failures | Run `/logout`, close, restart with `claude`, re-authenticate |
| High CPU/memory | Use `/compact` regularly, restart between major tasks, add build dirs to `.gitignore` |
| Command hangs | Ctrl+C to cancel; close terminal and restart if unresponsive |
| Search not working | Install system ripgrep: `brew install ripgrep`; set `USE_BUILTIN_RIPGREP=0` |
| Skills/agents not loading | Install ripgrep (required for discovery) |
| MCP server not starting | Check with `claude --mcp-debug`; verify command exists and is executable |
| Plugin not loading | Run `claude plugin validate`; check directory structure |
| "Forgetting" mid-session | Context saturation -- use `/compact`, HANDOFF.md pattern, or start fresh sessions |
| 403 Forbidden after login | Check subscription at claude.ai/settings; check for stale `ANTHROPIC_API_KEY` in shell profile |

### 3.5 How to Read and Interpret Session Logs

Session transcripts are stored as JSONL files at:
```
~/.claude/projects/[project-hash]/[session-id].jsonl
```

Each line is a JSON object representing one turn (user message, assistant response, tool call, or tool result).

Debug logs (when `--debug` is enabled) are written to a separate file. Location can be customized with `CLAUDE_CODE_DEBUG_LOGS_DIR`.

The `--debug` flag shows:
- Master loop iterations
- Tool selections and execution times
- Context usage percentage
- API request/response details
- MCP server initialization and tool registration

### 3.6 Environment Variables for Debugging

| Variable | Effect |
|----------|--------|
| `DEBUG=1` | Enables verbose debug logging (caution: may conflict with app-level DEBUG) |
| `CLAUDE_CODE_DEBUG_LOGS_DIR` | Routes debug logs to a custom directory |
| `DEBUG_SDK=1` | Enables SDK-level debug output |
| `MCP_TIMEOUT=60000` | Extends MCP connection timeout (prevents premature disconnects) |
| `IS_SANDBOX=1` | Bypasses security checks for VPS/dev environments |
| `USE_BUILTIN_RIPGREP=0` | Forces use of system ripgrep instead of bundled version |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Override auto-compaction trigger (1-100) |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Per-response generation limit (default 32K) |

Recommended debugging alias:
```bash
alias dclaude="export DEBUG_SDK=1 MCP_TIMEOUT=60000 CLAUDE_CODE_DEBUG_LOGS_DIR=~/claude-debug && claude"
```

### 3.7 How to Report Bugs Effectively

1. **Use `/feedback` inside Claude Code** -- reports directly to Anthropic with session context
2. **File GitHub issues** at `github.com/anthropics/claude-code` with:
   - Claude Code version (`claude --version`)
   - OS and shell information
   - Steps to reproduce
   - Expected vs actual behavior
   - Debug log excerpts (`claude --debug` output)
   - For MCP issues: `claude --mcp-debug` output
   - For IDE issues: IDE name/version, extension version, shell type

---

## 4. Monorepo and Multi-Repo Strategies

### 4.1 How Claude Code Handles Monorepos

Claude Code natively supports hierarchical configuration. When you work in a monorepo, it loads CLAUDE.md files from the project root AND from subdirectories as you navigate into them. This provides automatic context scoping without manual configuration.

### 4.2 CLAUDE.md Hierarchy in Monorepos

#### Directory structure

```
monorepo/
  CLAUDE.md                    # Root: CI/CD, tooling, deployment, coding standards
  packages/
    api/
      CLAUDE.md                # API-specific: endpoints, DB schema, auth patterns
      .claude/skills/          # API-specific skills
    frontend/
      CLAUDE.md                # Frontend-specific: components, routing, state management
      .claude/skills/          # Frontend-specific skills
    shared/
      CLAUDE.md                # Shared libraries: types, utils, conventions
```

#### Load order and precedence

```
Global (~/.claude/CLAUDE.md)
  -> Project root (CLAUDE.md)
    -> Subdirectory (packages/api/CLAUDE.md)
      -> User-specific (~/.claude/projects/<hash>/CLAUDE.md)
```

Later files take precedence. All levels contribute simultaneously -- they are merged, not replaced.

**Skills auto-discovery**: When editing files in `packages/frontend/`, Claude Code automatically discovers and loads skills from `packages/frontend/.claude/skills/`.

#### Real-world optimization example

One developer reduced a monorepo CLAUDE.md from **47,000 words to 9,000 words** (80% reduction) by splitting into service-specific files:

| File | Size |
|------|------|
| Root CLAUDE.md | 8,902 characters |
| frontend/CLAUDE.md | 8,647 characters |
| backend/CLAUDE.md | 7,892 characters |
| core/CLAUDE.md | 7,277 characters |

Each CLAUDE.md loads only when Claude works in that directory, so token cost scales with the area of work, not the total monorepo size.

#### What to put where

**Root CLAUDE.md**: Build system, CI/CD commands, coding standards that apply everywhere, package manager conventions, testing commands, deployment procedures.

**Package-level CLAUDE.md**: Package-specific architecture, API contracts, database schema for that service, technology choices unique to the package, package-specific testing patterns.

### 4.3 Working Across Multiple Repos

#### --add-dir for cross-repo work

```bash
# Working on API but need access to shared types and frontend contracts
claude --add-dir ../shared --add-dir ../frontend
```

Skills from added directories are loaded and support live change detection.

**Loading CLAUDE.md from --add-dir paths** (v2.1.20+):
```bash
export CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1
claude --add-dir ../other-repo
```

This applies the other repo's CLAUDE.md instructions to your session.

#### Multi-repo context loading architecture

Claude Code treats repository boundaries as organizational artifacts and follows actual dependency chains regardless of which repo code lives in. A dedicated MCP server approach can optimize this:

1. **Repository Registry**: Maps repo names and package names to local paths
2. **Symbol Extractor**: Uses tree-sitter AST parsing to locate specific functions/classes across repos
3. **Dependency Resolver**: Traces import chains while respecting token budgets
4. **Token-aware traversal**: Extracts only needed symbols (150 tokens) vs. entire packages (8,000+ tokens) -- claimed 99% token savings

#### Cross-repo workflow strategy

For features spanning repositories:
1. Start in the data/config repository to define schema changes
2. Ask Claude "What else needs to change when I modify this schema?" to trace dependencies
3. Use `--add-dir` to bring dependent repos into context
4. Work through changes in dependency order

**Token budget warning**: Teams working with microservices or multi-repo architectures can burn 40-60% of their token budget on cross-repo context duplication. Mitigate with scoped requests and the symbol extraction approach.

### 4.4 Workspace-Aware Configurations

#### Configuration hierarchy (all scopes)

| Scope | File | Purpose |
|-------|------|---------|
| Global | `~/.claude/CLAUDE.md` | Personal instructions across all projects |
| Global settings | `~/.claude/settings.json` | Global permissions, hooks, model overrides |
| Project (committed) | `CLAUDE.md` | Team-shared project instructions |
| Project settings | `.claude/settings.json` | Team-shared permissions and hooks |
| Subdirectory | `packages/api/CLAUDE.md` | Package-specific instructions |
| Local settings | `.claude/settings.local.json` | Personal project overrides (gitignored) |
| User project | `~/.claude/projects/<hash>/CLAUDE.md` | Per-user per-project instructions |

#### MCP configuration hierarchy

| Scope | File | Committed? |
|-------|------|-----------|
| Project-shared | `.mcp.json` in repo root | Yes |
| Local | `.claude/mcp.json` | No |
| Global | `~/.claude/mcp.json` | N/A |

---

## 5. Performance Optimization

### 5.1 Making Claude Code Faster (Response Time)

#### Model selection is the biggest lever

| Model | Speed | Cost (relative) | Use For |
|-------|-------|-----------------|---------|
| **Haiku** | Fastest | 1x | File exploration, simple reads, boilerplate |
| **Sonnet** | Fast | 3x | Daily development (90% of tasks) |
| **Opus** | Slowest | 5x | Complex architecture, deep debugging |
| **opusplan** | Hybrid | Variable | Opus for planning, auto-switches to Sonnet for execution |

Setting Sonnet as default saves ~80% on costs vs Opus while maintaining excellent performance for most work.

```bash
# Set default model
claude --model sonnet

# Switch mid-session
/model opus    # for complex reasoning
/model sonnet  # return to normal
/model haiku   # for quick reads

# Extended context (avoids compaction overhead)
claude --model sonnet[1m]
```

Configuration priority: `/model` command > `--model` flag > `ANTHROPIC_MODEL` env var > `settings.json` model field.

#### Reduce context loading time

- Use `.claudeignore` to exclude irrelevant directories
- Keep CLAUDE.md concise (target <10K words)
- Use `disable-model-invocation: true` on skills that are only needed on demand
- Scope MCP servers to subagents (inline definitions) to avoid loading tool definitions in main context

#### Use subagents for parallelism

Spawn multiple subagents for independent investigations to complete work faster:
```
Research the authentication, database, and API modules
in parallel using separate subagents
```

### 5.2 Making Claude Code Cheaper (Token Efficiency)

#### The 60% savings stack (cumulative techniques)

1. **`.claudeignore` file** -- Exclude `node_modules/`, `dist/`, `.next/`, `build/`, `*.lock`, `*.min.js`, `target/`, `__pycache__/`. For Next.js, just `.next/` cuts context by 30-40%.

2. **Skills-based progressive disclosure** -- Load domain knowledge on-demand with skills instead of putting everything in CLAUDE.md. ClaudeFast's Code Kit recovers ~15,000 tokens per session (82% improvement).

3. **Preprocessing hooks** -- Instead of Claude reading a 10,000-line log, a hook greps for ERROR and returns only matching lines.

4. **Specific file paths in prompts** -- "Fix the auth error in src/login.ts at line 47" vs "Something's broken" eliminates detective-work token costs.

5. **Subagent delegation** -- Delegate verbose operations (test runs, log analysis) to subagents. Only the summary returns to the main conversation.

6. **Model selection per task** -- Haiku for exploration, Sonnet for implementation, Opus only for complex reasoning.

7. **Strategic `/compact`** -- Run at ~50% context utilization (before the ~80% auto-compact threshold). Use with guidance: `/compact preserve the API design decisions`.

8. **`/clear` between unrelated tasks** -- Fully resets context.

9. **Headless mode** -- `claude --print` for automation (no interactive overhead).

10. **Batch requests** -- Combine related queries. Up to 50% reduction for batch-eligible workloads.

11. **1M context models** -- `sonnet[1m]` avoids compaction costs entirely for long sessions.

#### Measured results

- Scoped requests (3 files, 4,200 tokens) vs unscoped (45 files, 35,000 tokens) = 88% reduction
- Combined optimization: developers report 30-55% token reduction and 60% faster response times over a work week
- 60-line CLAUDE.md + `.claudeignore` + strategic sessions + scoped requests = 30-50% savings

### 5.3 Caching and Context Optimization

**Automatic prompt caching**: System prompts, tool definitions, and conversation history are cached automatically. Cache reads cost 10% of normal input price. Typical sessions: 90%+ cache reads, ~6% cache writes, <1% actual input+output tokens.

**Cache invalidation gotcha**: Adding one MCP tool changes the prefix hash, invalidating cache for the entire conversation. Be deliberate about active MCP servers.

**Tool Search feature**: Dynamically loads only needed tool definitions when tools exceed 10% of context. Cuts context from ~72K to ~8.7K tokens (85% reduction). Requires Sonnet 4+ or Opus 4+.

**Context monitoring**:
- `/context` -- shows current usage, warnings about excluded skills
- `/usage` -- session and weekly token totals
- `claude-hud` plugin -- real-time context display in terminal
- Custom StatusLine -- real-time display with 10 color themes

### 5.4 .claudeignore Patterns

Create `.claudeignore` in project root (same syntax as `.gitignore`):

```gitignore
# Build outputs
dist/
build/
.next/
out/
target/

# Dependencies
node_modules/
vendor/
.venv/
__pycache__/

# Generated files
*.min.js
*.min.css
*.map
*.lock
package-lock.json
yarn.lock

# Large data
*.csv
*.sql
*.sqlite
*.db
data/

# IDE and OS
.idea/
.vscode/
*.swp
.DS_Store
Thumbs.db

# Logs
logs/
*.log
```

For Next.js projects, adding just `.next/` cuts context by 30-40% -- the single fastest win with no tradeoffs.

### 5.5 Cost Benchmarks

| Metric | Value |
|--------|-------|
| Average daily cost | ~$6/developer (API) |
| 90th percentile | <$12/day |
| Monthly range (Sonnet) | $100-$200/developer |
| Ralph Wiggum autonomous rate | ~$10.42/hour (Sonnet) |
| Anthropic Code Review plugin | $15-$25/review |

**Per-model token pricing**:

| Model | Input | Output | Cache Write | Cache Read |
|-------|-------|--------|-------------|------------|
| Opus | $5/MTok | $25/MTok | $6.25/MTok | $0.50/MTok |
| Sonnet | $3/MTok | $15/MTok | $3.75/MTok | $0.30/MTok |
| Haiku | $1/MTok | $5/MTok | $1.25/MTok | $0.10/MTok |

**Subscription breakeven**: API > $100/month makes Max 5x worthwhile; API > $200/month makes Max 20x worthwhile.

---

## 6. Claude Code SDK/API for Building Tools ON TOP of Claude Code

### 6.1 The Claude Agent SDK (formerly @anthropic-ai/claude-code)

The Claude Code SDK has been renamed to the **Claude Agent SDK**. It gives you the same tools, agent loop, and context management that power Claude Code, fully programmable in Python and TypeScript.

**Installation**:
```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install anthropic-claude-agent-sdk
```

**Package versions** (March 2026): Python v0.1.48 on PyPI, TypeScript v0.2.71 on npm.

**Requirements**: Node.js 18+ (TypeScript), Python 3.10+ (Python).

### 6.2 Core API -- The `query()` Function

The `query()` function is the main entry point. It creates the agentic loop and returns an async iterator:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Review src/ for security issues",
  options: {
    model: "sonnet",
    allowedTools: ["Read", "Glob", "Grep", "Bash"],
    maxTurns: 250,
  }
})) {
  // Handle streaming messages
  if (message.type === "system" && message.subtype === "init") {
    console.log("Session ID:", message.session_id);
  }
  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);
      else if ("name" in block) console.log(`Tool: ${block.name}`);
    }
  }
  if (message.type === "result" && message.subtype === "success") {
    console.log(`Cost: $${message.total_cost_usd.toFixed(4)}`);
  }
}
```

**Message types**:
- `system` (subtype: `init`) -- session initialization, provides `session_id`
- `assistant` -- Claude's responses with text and tool_use blocks
- `user` -- echoed input
- `result` (subtype: `success` | `error`) -- completion with cost tracking

### 6.3 Built-in Tools

Eight pre-configured tools available without manual implementation:

| Tool | Purpose |
|------|---------|
| Read | File access |
| Write | File creation |
| Edit | Precise modifications |
| Bash | Commands and git operations |
| Glob | Pattern-based file discovery |
| Grep | Regex file search |
| WebSearch | Web queries |
| WebFetch | URL fetch and parsing |

Enable selectively via `allowedTools`:
```typescript
options: { allowedTools: ["Read", "Glob", "Grep"] }  // read-only agent
```

### 6.4 Custom Tools with In-Process MCP

Custom tools run as in-process MCP servers -- no separate process needed:

```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const analyticsServer = createSdkMcpServer({
  name: "analytics",
  version: "1.0.0",
  tools: [
    tool(
      "calculate_metrics",
      "Compute performance metrics for a file",
      { filePath: z.string().describe("Target file path") },
      async (args) => ({
        content: [{
          type: "text",
          text: `Metrics for ${args.filePath}: ...`
        }]
      })
    )
  ]
});

for await (const msg of query({
  prompt: "Analyze performance",
  options: {
    mcpServers: { analytics: analyticsServer },
    allowedTools: ["Read", "mcp__analytics__calculate_metrics"]
  }
})) { /* ... */ }
```

### 6.5 Programmatic Session Management

Sessions maintain context across multiple queries. Capture `session_id` from initialization, then resume:

```typescript
let sessionId: string | undefined;

// First query -- establish context
for await (const msg of query({ prompt: "Read auth.ts and explain the login flow" })) {
  if (msg.type === "system" && msg.subtype === "init") {
    sessionId = msg.session_id;
  }
}

// Second query -- same context, zero re-reading
for await (const msg of query({
  prompt: "Now find all callers of the login function",
  options: { resume: sessionId },
})) {
  // Claude already has auth.ts in context -- no tool calls to re-read
}
```

### 6.6 Permission Control

Three permission modes plus granular control:

```typescript
// Mode-based
options: { permissionMode: "default" }        // Requires approval prompts
options: { permissionMode: "acceptEdits" }    // Auto-approves file mods
options: { permissionMode: "bypassPermissions" }  // No prompts (caution)

// Granular function-based
options: {
  canUseTool: async (toolName, input) => {
    if (["Read", "Glob"].includes(toolName)) {
      return { behavior: "allow", updatedInput: input };
    }
    if (toolName === "Write" && input.file_path?.includes(".env")) {
      return { behavior: "deny", message: "Cannot modify .env files" };
    }
    return { behavior: "allow", updatedInput: input };
  }
}
```

### 6.7 Hooks for Event Interception

```typescript
import { HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

// Audit logging hook
const auditLog: HookCallback = async (input, toolUseId) => {
  if (input.hook_event_name === "PreToolUse") {
    const pre = input as PreToolUseHookInput;
    console.log(`[${new Date().toISOString()}] ${pre.tool_name}`);
  }
  return {};
};

// Security gate hook
const blockDangerous: HookCallback = async (input) => {
  if (input.hook_event_name === "PreToolUse") {
    const pre = input as PreToolUseHookInput;
    if (pre.tool_name === "Bash") {
      const cmd = (pre.tool_input as any).command || "";
      if (cmd.includes("rm -rf")) {
        return {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "Destructive command blocked"
          }
        };
      }
    }
  }
  return {};
};

options: {
  hooks: {
    PreToolUse: [
      { hooks: [auditLog] },
      { matcher: "Bash", hooks: [blockDangerous] }
    ]
  }
}
```

Available hook events: `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`.

### 6.8 Subagents for Task Delegation

Define specialized agents that Claude can delegate to:

```typescript
options: {
  agents: {
    "security-expert": {
      description: "Vulnerability detection specialist",
      prompt: "Focus on: SQL injection, XSS, auth flaws",
      tools: ["Read", "Grep", "Glob"],
      model: "sonnet"
    },
    "test-analyzer": {
      description: "Test coverage and quality assessment",
      prompt: "Analyze: gaps, edge cases, reliability",
      tools: ["Read", "Grep", "Glob"],
      model: "haiku"
    }
  }
}
```

Claude delegates automatically via the `Task` tool.

### 6.9 Structured Output

Return programmatic data using JSON schemas:

```typescript
const schema = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { enum: ["low", "medium", "high", "critical"] },
          file: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    overallScore: { type: "number" }
  }
};

for await (const msg of query({
  prompt: "Review src/ for bugs",
  options: {
    outputFormat: { type: "json_schema", schema }
  }
})) {
  if (msg.type === "result" && msg.structured_output) {
    const data = msg.structured_output;
    console.log(`Score: ${data.overallScore}/100`);
    console.log(`Issues: ${data.issues.length}`);
  }
}
```

### 6.10 Building Custom UIs on Top of Claude Code

#### Terminal UI with Ink (React for terminals)

```typescript
import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp, render } from "ink";
import { query } from "@anthropic-ai/claude-agent-sdk";

function App({ prompt }: { prompt: string }) {
  const [lines, setLines] = useState<{type: string, text: string}[]>([]);
  const [done, setDone] = useState(false);
  const { exit } = useApp();

  useEffect(() => {
    (async () => {
      for await (const msg of query({
        prompt,
        options: { allowedTools: ["Read", "Glob", "Grep", "Bash"] }
      })) {
        if (msg.type === "assistant") {
          for (const block of msg.message.content) {
            if (block.type === "text") {
              setLines(prev => [...prev, { type: "agent", text: block.text }]);
            }
            if (block.type === "tool_use") {
              setLines(prev => [...prev, {
                type: "tool",
                text: `${block.name}(${JSON.stringify(block.input).slice(0, 60)})`
              }]);
            }
          }
        }
        if (msg.type === "result") {
          setLines(prev => [...prev, { type: "result", text: msg.result }]);
          setDone(true);
        }
      }
    })();
  }, []);

  useInput((_, key) => { if (key.escape) exit(); });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">AI Terminal</Text>
      {lines.map((line, i) => <Text key={i}>{line.text}</Text>)}
      {!done && <Text color="gray">thinking...</Text>}
    </Box>
  );
}

const prompt = process.argv.slice(2).join(" ");
render(<App prompt={prompt} />);
```

Requirements: `"type": "module"` in package.json, use `tsx` instead of `ts-node`.

#### REPL mode (persistent conversation)

```typescript
let sessionId: string | undefined;

async function runTurn(userPrompt: string) {
  for await (const msg of query({
    prompt: userPrompt,
    options: {
      allowedTools: ["Read", "Glob", "Grep", "Bash"],
      resume: sessionId
    },
  })) {
    if (msg.type === "system" && msg.subtype === "init") {
      sessionId = msg.session_id;
    }
    if (msg.type === "assistant") {
      for (const block of msg.message.content) {
        if (block.type === "text") process.stdout.write(block.text + "\n");
      }
    }
  }
}

while (true) {
  const input = await readline.question("> ");
  if (input.trim()) await runTurn(input.trim());
}
```

### 6.11 Integration with Other Dev Tools

#### GitHub Actions integration

Use `anthropics/claude-code-action@v1`:

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
            Review this PR for security, performance, and style issues.
          claude_args: |
            --max-turns 10
            --model claude-sonnet-4-6
```

Key inputs: `trigger_phrase`, `assignee_trigger`, `label_trigger`, `track_progress`, `plugins`, `settings`, `use_commit_signing`, `allowed_bots`.

Structured output for automation:
```yaml
- uses: anthropics/claude-code-action@v1
  id: analyze
  with:
    prompt: "Check CI logs. Return: is_flaky (boolean), confidence (0-1), summary"
    claude_args: |
      --json-schema '{"type":"object","properties":{"is_flaky":{"type":"boolean"},"confidence":{"type":"number"},"summary":{"type":"string"}}}'

- if: fromJSON(steps.analyze.outputs.structured_output).is_flaky == true
  run: gh workflow run CI
```

#### Claude Code as an MCP Server

`claude mcp serve` exposes Claude Code's file editing and command execution tools via MCP, allowing other MCP clients (Claude Desktop, Cursor, Windsurf) to invoke Claude Code remotely.

#### Cost tracking in SDK

```typescript
if (message.type === "result" && message.subtype === "success") {
  console.log("Total cost:", message.total_cost_usd);
  console.log("Token usage:", message.usage);
  for (const [model, usage] of Object.entries(message.modelUsage || {})) {
    console.log(`${model}: $${usage.costUSD.toFixed(4)}`);
  }
}
```

---

## Sources

### Official Documentation
- [Build an MCP server](https://modelcontextprotocol.io/docs/develop/build-server)
- [Create plugins - Claude Code Docs](https://code.claude.com/docs/en/plugins)
- [Plugins reference - Claude Code Docs](https://code.claude.com/docs/en/plugins-reference)
- [Troubleshooting - Claude Code Docs](https://code.claude.com/docs/en/troubleshooting)
- [Agent SDK overview - Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Best Practices - Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Model configuration - Claude Code Docs](https://code.claude.com/docs/en/model-config)
- [MCP Transport Protocols](https://mcpcat.io/guides/comparing-stdio-sse-streamablehttp/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)

### SDKs and Repositories
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python MCP SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Claude Agent SDK TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript)
- [Claude Agent SDK Python](https://github.com/anthropics/claude-agent-sdk-python)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [AWS MCP Servers](https://github.com/awslabs/mcp)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [claude-hud](https://github.com/jarrodwatts/claude-hud)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)
- [Awesome Claude Plugins](https://github.com/ComposioHQ/awesome-claude-plugins)
- [Official Claude Plugins](https://github.com/anthropics/claude-plugins-official)

### Community Guides and Articles
- [Building Agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)
- [Claude Agent SDK: Build Your Own AI Terminal in 10 Minutes](https://www.mager.co/blog/2026-03-14-claude-agent-sdk-tui)
- [The Complete Guide to Building Agents](https://nader.substack.com/p/the-complete-guide-to-building-agents)
- [How I Organized My CLAUDE.md in a Monorepo](https://dev.to/anvodev/how-i-organized-my-claudemd-in-a-monorepo-with-too-many-contexts-37k7)
- [Claude Code Decoded: Multi-Repo Context Loading](https://blackdoglabs.io/blog/claude-code-decoded-multi-repo-context)
- [Debugging Claude Code Issues: Undocumented Environment Variables](https://www.turboai.dev/blog/debugging-claude-code-issues)
- [Claude Code Models: Choose the Right AI](https://claudefa.st/blog/models/model-selection)
- [How to Reduce Token Usage in Claude Code](https://docs.bswen.com/blog/2026-03-10-reduce-claude-code-token-usage/)
- [How I Reduced Claude Code Token Consumption by 50%](https://32blog.com/en/claude-code/claude-code-token-cost-reduction-50-percent)
- [10 Top Claude Code Plugins to Consider in 2026](https://composio.dev/content/top-claude-code-plugins)
- [A Mental Model for Claude Code: Skills, Subagents, and Plugins](https://levelup.gitconnected.com/a-mental-model-for-claude-code-skills-subagents-and-plugins-3dea9924bf05)
- [MCP Server Security Best Practices](https://www.truefoundry.com/blog/mcp-server-security-best-practices)
- [Polyrepo Synthesis with Claude Code](https://rajiv.com/blog/2025/11/30/polyrepo-synthesis-synthesis-coding-across-multiple-repositories-with-claude-code-in-visual-studio-code/)
