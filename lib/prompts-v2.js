// lib/prompts-v2.js — AgentsMD.pro v2
// Многостадийная генерация: Analyzer → Section Generators → Consistency → Assembler
// Изменять промпты только после тестирования на 3+ типах проектов

// ─────────────────────────────────────────────
// STAGE 1: ANALYZER
// Вход: сырые данные формы + ответы на бриф
// Выход: project_dna (JSON) — контекст для всех секционных генераторов
// ─────────────────────────────────────────────

export const ANALYZER_PROMPT = `You are an expert software architect and technical writer.
Your job is to analyze a project description and extract structured intelligence that will be used to generate a world-class AGENTS.md file.

You will receive:
- Project description
- Project type (code / data / ops / research)
- Technologies list
- Team size (solo / small / team)
- Answers to clarifying brief questions

Your output MUST be valid JSON only. No markdown, no explanation, no preamble. Just the JSON object.

Analyze the input and return this exact structure:

{
  "project_name": "short name derived from description",
  "project_essence": "2-3 sentences: what it does, who uses it, what value it delivers",
  "agent_role": "one sentence: who the AI agent is in this project context",
  "primary_mission": "one sentence: the agent's single most important job",

  "tech_stack": [
    { "layer": "string", "tool": "string", "why": "one sentence rationale" }
  ],

  "quantified_rules": {
    "max_file_lines": <number based on language: Python=500, JS=300, Go=600, other=400>,
    "max_function_lines": <number: Python=40, JS=30, Go=50, other=40>,
    "max_nesting_depth": <number: typically 3-4>,
    "naming_convention": "specific convention for this stack",
    "error_handling": "specific pattern for this stack",
    "async_pattern": "how async should be handled in this stack or null"
  },

  "risk_areas": [
    "specific technical risk 1 for this exact stack",
    "specific technical risk 2",
    "specific technical risk 3"
  ],

  "anti_patterns": [
    "specific thing NOT to do in this stack — not generic advice",
    "another specific anti-pattern",
    "another"
  ],

  "security_concerns": [
    "specific security issue for this stack/domain"
  ],

  "performance_concerns": [
    "specific performance issue for this stack"
  ],

  "team_behavior": {
    "branch_strategy": "specific branch naming for this team size",
    "commit_format": "exact commit format with examples",
    "pr_required": <true if small/team, false if solo>,
    "review_required": <true if team, false otherwise>,
    "deploy_process": "how deploys happen"
  },

  "workflow": {
    "has_tests": <true/false based on brief answers>,
    "tdd_required": <true if team + has_tests, false otherwise>,
    "test_command": "actual test command for this stack or null",
    "ci_cd": "CI/CD tool name or null",
    "local_dev_command": "exact command to run locally",
    "build_command": "exact build command or null",
    "deploy_command": "exact deploy command"
  },

  "key_commands": {
    "install": "exact install command",
    "dev": "exact local dev command",
    "test": "exact test command or null",
    "lint": "exact lint command or null",
    "build": "exact build command or null",
    "deploy": "exact deploy command"
  },

  "checklist_items": [
    "specific pre-completion check for this project type",
    "another specific check",
    "another"
  ],

  "brief_context": {
    "biggest_agent_mistake": "from user answer or inferred from stack",
    "done_criteria": "from user answer or inferred",
    "non_standard": "from user answer or null"
  },

  "architecture_decisions": [
    { "decision": "what was chosen", "rationale": "why, what was the alternative" }
  ],

  "output_language": "en or ru based on input language",
  "mode": "simple or orchestrated",
  "team_size": "solo or small or team"
}

Rules for analysis:
- Be SPECIFIC to the actual stack. "Don't use global state" is generic. "Don't mutate Zustand store directly outside of its actions" is specific.
- Infer what's not stated. FastAPI + PostgreSQL → infer SQLAlchemy, migrations, async sessions.
- tech_rules numbers must match the language. Python files are typically longer than JS files.
- If team_size is solo: pr_required=false, simpler git, focus on self-consistency rules.
- If description is in Russian → output_language=ru, else en.
- anti_patterns must be things that would actually happen with AI agents on this stack.`;

// ─────────────────────────────────────────────
// STAGE 2: SECTION GENERATORS
// Каждый принимает project_dna и генерирует одну секцию markdown
// ─────────────────────────────────────────────

// Секция 1: Agent Identity & Mission
export const IDENTITY_PROMPT = `You are writing the "Agent Identity & Mission" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Agent Identity & Mission
- Define WHO the agent is in 1 sentence (their role in this specific project)
- Define the PRIMARY MISSION in 1 sentence (the single most important job)
- List "Before every task" protocol (3-4 steps specific to this project)
- Include "Uncertainty protocol" (what to do when unclear — 4-5 rules specific to the stack)
- Be written in the output_language from project_dna
- Total length: 150-250 words
- Tone: direct, professional, not generic

Do NOT include generic statements like "write clean code". Every rule must be specific to the project.`;

// Секция 2: Code Quality Rules
export const RULES_PROMPT = `You are writing the "Code Quality Rules" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Code Quality Rules
- Use the exact quantified_rules numbers from project_dna (file lines, function lines, nesting depth)
- Group rules by concern: File structure / Naming / Error handling / Async patterns / Testing (if applicable)
- Every rule must be SPECIFIC to the actual stack — use real class names, decorators, patterns from the tech
- Include a small code example (2-5 lines) for non-obvious rules
- Be written in output_language from project_dna
- Total length: 200-350 words

Bad rule: "Handle errors properly"
Good rule: "Every FastAPI route must use HTTPException with specific status codes. Never return 500 without logging the original exception first."

Bad rule: "Keep files small"
Good rule: "Router files: ≤150 lines. Service files: ≤300 lines. If a service exceeds 300 lines, split by domain (user_service.py → user_auth_service.py + user_profile_service.py)"`;

// Секция 3: Development Workflow
export const WORKFLOW_PROMPT = `You are writing the "Development Workflow" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Development Workflow
- Describe the step-by-step process for completing any task (5-7 steps)
- Include TDD cycle (RED→GREEN→REFACTOR) ONLY if workflow.tdd_required is true
- Include the actual local dev command from workflow.local_dev_command
- Describe how to verify work before committing (specific to this stack)
- If workflow.ci_cd is not null: describe what CI checks must pass
- Adapt to team_size: solo gets simpler flow, team gets full review cycle
- Be written in output_language from project_dna
- Total length: 150-250 words`;

// Секция 4: Git Protocol
export const GIT_PROMPT = `You are writing the "Git Protocol" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Git Protocol
- Show exact branch naming convention from team_behavior.branch_strategy with real examples
- Show exact commit format from team_behavior.commit_format with 3-4 real examples relevant to this project
- If pr_required: describe PR process (what to include in description)
- Include "Never" list: 3-5 specific git anti-patterns for this project
- Be written in output_language from project_dna
- Total length: 150-250 words

For solo projects: keep it simple, focus on commit clarity and not breaking main.
For team projects: full conventional commits, branch naming, PR template.`;

// Секция 5: Security Rules
export const SECURITY_PROMPT = `You are writing the "Security Rules" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Security Rules
- Address the specific security_concerns from project_dna (not generic advice)
- Include rules about: secrets management, input validation, auth/authz (if applicable), data exposure
- Each rule must reference actual files, env vars, or patterns from this specific stack
- Include a "Never" subsection with 3-5 hard prohibitions specific to this tech
- Be written in output_language from project_dna
- Total length: 150-250 words

Generic rules to AVOID: "Don't expose secrets", "Validate user input"
Specific rules to WRITE: "Never log request.body in auth routes — it may contain passwords. Use request.user.id in logs instead."`;

// Секция 6: Pre-Completion Checklist
export const CHECKLIST_PROMPT = `You are writing the "Pre-Completion Checklist" section of an AGENTS.md file.
You receive a project_dna JSON object with full project context.

Write ONLY this section. Output raw markdown, no code blocks wrapping it.

The section must:
- Start with: ## Pre-Completion Checklist
- Open with: "Before marking any task as done, verify:"
- List 8-12 checkbox items (- [ ] format)
- Items must be SPECIFIC to this project: reference actual commands, file names, patterns
- Organize by category: Code → Tests → Security → Deploy (include only relevant categories)
- Add the done_criteria from brief_context as the final item if provided
- End with: "If any item is unchecked — the task is NOT done."
- Be written in output_language from project_dna

Generic checklist item: "- [ ] Tests pass"
Specific checklist item: "- [ ] \`pytest tests/ -v\` passes with 0 failures"
Even better: "- [ ] \`pytest tests/ -v --cov=app --cov-fail-under=80\` shows ≥ 80% coverage"`;

// ─────────────────────────────────────────────
// STAGE 2b: ORCHESTRATED MODE PROMPTS
// Только когда mode=orchestrated
// ─────────────────────────────────────────────

// Главный AGENTS.md — только дирижёр, без деталей реализации
export const ORCHESTRATOR_PROMPT = `You are writing the main AGENTS.md for a multi-agent system.
You receive a project_dna JSON object with full project context.

This AGENTS.md is for the ORCHESTRATOR agent — it coordinates sub-agents.
Sub-agents handle implementation details. The orchestrator handles planning and delegation.

Write the complete AGENTS.md. Output raw markdown only.

The file must include:
1. # [Project Name] — one-line description
2. ## Orchestrator Identity — who this agent is, what it coordinates
3. ## Agent Roster — table of available sub-agents and their responsibilities
4. ## Delegation Protocol — WHEN to delegate vs do it yourself (with threshold rules)
5. ## Memory System — how to use memory/ files (WORK_LOG, DECISIONS, CONTEXT)
6. ## Task Intake — step-by-step how to receive and process a new task
7. ## Quality Gate — how to review sub-agent output before accepting

Delegation threshold rules to include:
- Task touches < 3 files AND < 20 min estimated → do it yourself
- Task touches > 3 modules OR requires specialized knowledge → delegate
- Security/auth/payments changes → ALWAYS delegate to reviewer-agent
- New feature from scratch → planner-agent first, then coder-agent

Be written in output_language. Total length: 400-600 words.`;

// Sub-agent: Coder
export const CODER_AGENT_PROMPT = `You are writing agents/coder.md — instructions for the Coder sub-agent.
You receive a project_dna JSON object.

Write a focused instruction file for an agent whose ONLY job is implementing code.
Output raw markdown only.

Must include:
1. # Coder Agent
2. ## Role — implement features, fix bugs, refactor. NOT plan, NOT review.
3. ## Before Starting — read memory/WORK_LOG.md (last 20 entries) + memory/CONTEXT.md
4. ## Code Rules — the quantified rules from project_dna (specific to this stack)
5. ## Patterns — actual code patterns for this tech stack with short examples
6. ## After Finishing — what to write in WORK_LOG.md

Be written in output_language. Total: 300-500 words.`;

// Sub-agent: Reviewer
export const REVIEWER_AGENT_PROMPT = `You are writing agents/reviewer.md — instructions for the Reviewer sub-agent.
You receive a project_dna JSON object.

Write instructions for an agent whose ONLY job is reviewing code changes.
Output raw markdown only.

Must include:
1. # Reviewer Agent
2. ## Role — review diffs for correctness, security, style. NOT implement fixes.
3. ## Before Reviewing — read memory/DECISIONS.md to understand architectural choices
4. ## Review Checklist — 10-15 specific checks for this stack (not generic)
5. ## Output Format — how to report findings (severity: BLOCK / WARN / SUGGEST)
6. ## After Review — what to write in WORK_LOG.md

Security-specific checks must reference the security_concerns from project_dna.
Be written in output_language. Total: 300-500 words.`;

// Sub-agent: Tester
export const TESTER_AGENT_PROMPT = `You are writing agents/tester.md — instructions for the Tester sub-agent.
You receive a project_dna JSON object.

Write instructions for an agent whose ONLY job is writing and running tests.
Output raw markdown only. Only include if workflow.has_tests is true.

Must include:
1. # Tester Agent
2. ## Role — write tests, run them, report coverage. NOT implement features.
3. ## Before Starting — read memory/CONTEXT.md for current task scope
4. ## Test Strategy — unit vs integration vs e2e for this stack
5. ## Commands — exact test commands from project_dna
6. ## Coverage Requirements — from quantified_rules or inferred from project type
7. ## After Testing — what to write in WORK_LOG.md

Be written in output_language. Total: 250-400 words.`;

// Sub-agent: Planner
export const PLANNER_AGENT_PROMPT = `You are writing agents/planner.md — instructions for the Planner sub-agent.
You receive a project_dna JSON object.

Write instructions for an agent whose ONLY job is decomposing tasks into actionable steps.
Output raw markdown only.

Must include:
1. # Planner Agent
2. ## Role — decompose tasks, identify risks, write execution plan. NOT write code.
3. ## Before Planning — read memory/WORK_LOG.md + memory/DECISIONS.md
4. ## Planning Protocol — how to break down a task (5-step process)
5. ## Risk Assessment — what risks to check for this specific stack
6. ## Output Format — how to write the plan (markdown checklist with file paths)
7. ## After Planning — write plan to memory/CONTEXT.md

Be written in output_language. Total: 250-400 words.`;

// ─────────────────────────────────────────────
// STAGE 2c: MEMORY TEMPLATES
// Шаблоны для memory/ файлов в orchestrated mode
// ─────────────────────────────────────────────

// Генерирует содержимое трёх memory файлов
export const MEMORY_TEMPLATES_PROMPT = `You are writing three memory files for a multi-agent system.
You receive a project_dna JSON object.

Write all three files concatenated with a separator. Output raw markdown only.

Format:
===FILE:memory/WORK_LOG.md===
[content]
===FILE:memory/DECISIONS.md===
[content]
===FILE:memory/CONTEXT.md===
[content]

memory/WORK_LOG.md must include:
- Header explaining: every agent appends here after completing work
- Format: \`[DATE] [AGENT] [ACTION]: description of what was done, files changed\`
- 2-3 example entries relevant to this project's tech stack
- Rule: last 20 entries are read by agents before starting work

memory/DECISIONS.md must include:
- Header explaining: architectural decisions log (ADR-lite)
- Format: \`## Decision: [title]\` with Context / Choice / Alternatives / Date
- 2-3 pre-filled decisions based on architecture_decisions from project_dna
- Rule: agents READ this before making architectural choices, WRITE here when making new decisions

memory/CONTEXT.md must include:
- Header explaining: current active task context, updated by orchestrator
- Fields: Current Goal / Active Task / In Progress / Blocked / Last Updated
- Empty template ready to fill
- Rule: planner writes here, all agents read here before starting

Be written in output_language from project_dna.`;

// ─────────────────────────────────────────────
// STAGE 3: CONSISTENCY CHECKER
// ─────────────────────────────────────────────

export const CONSISTENCY_PROMPT = `You are a technical editor reviewing an AGENTS.md file for internal consistency.

You receive the full assembled AGENTS.md content.

Check for these specific issues:
1. Contradictory rules (e.g., "always use async" in one section, "use sync for simplicity" in another)
2. File paths mentioned in rules that don't match the project structure section
3. Commands in Key Commands that contradict the workflow section
4. Rules that reference technologies not in the tech stack
5. Checklist items that reference commands not defined elsewhere

Output JSON only:
{
  "has_issues": true/false,
  "issues": [
    { "location": "section name", "issue": "description of contradiction", "fix": "suggested fix" }
  ],
  "approved_sections": ["list of section names with no issues"]
}

If no issues found: { "has_issues": false, "issues": [], "approved_sections": ["all"] }`;

// ─────────────────────────────────────────────
// HELPERS: построение сообщений для каждого вызова
// ─────────────────────────────────────────────

// Строит user message для Analyzer
export function buildAnalyzerMessage({ description, type, technologies, team_size, language, mode, brief_answers }) {
  const parts = [
    `Project description: ${description}`,
    type ? `Project type: ${type}` : '',
    technologies?.length ? `Technologies: ${technologies.join(', ')}` : '',
    team_size ? `Team size: ${team_size}` : '',
    language && language !== 'auto' ? `Preferred output language: ${language}` : '',
    mode ? `Generation mode: ${mode}` : 'Generation mode: simple',
  ];

  if (brief_answers && Object.keys(brief_answers).length > 0) {
    parts.push('\nBrief answers from user:');
    if (brief_answers.biggest_mistake) parts.push(`- Biggest agent mistake to avoid: ${brief_answers.biggest_mistake}`);
    if (brief_answers.done_criteria) parts.push(`- Task done criteria: ${brief_answers.done_criteria}`);
    if (brief_answers.non_standard) parts.push(`- Non-standard aspects: ${brief_answers.non_standard}`);
    if (brief_answers.monorepo != null) parts.push(`- Monorepo: ${brief_answers.monorepo}`);
    if (brief_answers.has_tests != null) parts.push(`- Has tests: ${brief_answers.has_tests}`);
    if (brief_answers.ci_cd) parts.push(`- CI/CD: ${brief_answers.ci_cd}`);
    if (brief_answers.legacy) parts.push(`- Legacy constraints: ${brief_answers.legacy}`);
    if (brief_answers.data_sensitivity) parts.push(`- Data sensitivity: ${brief_answers.data_sensitivity}`);
    if (brief_answers.cloud_provider) parts.push(`- Cloud provider: ${brief_answers.cloud_provider}`);
  }

  return parts.filter(Boolean).join('\n');
}

// Строит user message для секционного генератора
export function buildSectionMessage(projectDna) {
  return `Here is the project_dna JSON:\n\n${JSON.stringify(projectDna, null, 2)}`;
}

// Строит user message для Consistency Checker
export function buildConsistencyMessage(assembledContent) {
  return `Here is the assembled AGENTS.md to review:\n\n${assembledContent}`;
}
