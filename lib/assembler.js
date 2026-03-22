// lib/assembler.js — AgentsMD.pro v2
// Собирает финальный AGENTS.md из project_dna + сгенерированных секций
// Части, которые строятся из DNA напрямую (без Claude): Overview, TechStack, Commands, ArchDecisions

// Строит секцию Project Overview из DNA
function buildOverview(dna) {
  return `## Project Overview\n\n${dna.project_essence}\n`;
}

// Строит таблицу Tech Stack из DNA
function buildTechStack(dna) {
  if (!dna.tech_stack?.length) return '';
  const rows = dna.tech_stack
    .map(t => `| ${t.layer} | ${t.tool} | ${t.why} |`)
    .join('\n');
  return `## Tech Stack\n\n| Layer | Tool | Why |\n|-------|------|-----|\n${rows}\n`;
}

// Строит блок Key Commands из DNA
function buildKeyCommands(dna) {
  const k = dna.key_commands;
  if (!k) return '';
  const lines = [
    k.install  && `# Install dependencies\n${k.install}`,
    k.dev      && `\n# Local development\n${k.dev}`,
    k.test     && `\n# Run tests\n${k.test}`,
    k.lint     && `\n# Lint\n${k.lint}`,
    k.build    && `\n# Build\n${k.build}`,
    k.deploy   && `\n# Deploy\n${k.deploy}`,
  ].filter(Boolean).join('\n');
  return `## Key Commands\n\n\`\`\`bash\n${lines}\n\`\`\`\n`;
}

// Строит секцию Architecture Decisions из DNA
function buildArchDecisions(dna) {
  if (!dna.architecture_decisions?.length) return '';
  const items = dna.architecture_decisions
    .map(d => `**${d.decision}**\n\n${d.rationale}`)
    .join('\n\n');
  return `## Architecture Decisions\n\n${items}\n`;
}

// Парсит memory файлы из combined output MEMORY_TEMPLATES_PROMPT
function parseMemoryFiles(memoryContent) {
  if (!memoryContent) return [];
  const files = [];
  const regex = /===FILE:([^=]+)===\n([\s\S]*?)(?====FILE:|$)/g;
  let match;
  while ((match = regex.exec(memoryContent)) !== null) {
    const path = match[1].trim();
    const content = match[2].trim();
    if (path && content) files.push({ path, content });
  }
  return files;
}

// Собирает простой режим — один AGENTS.md файл
export function assembleSimple(dna, sections) {
  const { identity, rules, workflow, git, security, checklist } = sections;

  const parts = [
    `# ${dna.project_name}\n`,
    buildOverview(dna),
    buildTechStack(dna),
    identity   || '',
    rules      || '',
    workflow   || '',
    git        || '',
    security   || '',
    buildKeyCommands(dna),
    buildArchDecisions(dna),
    checklist  || '',
  ].filter(s => s.trim());

  return parts.join('\n---\n\n');
}

// Собирает orchestrated режим — массив файлов для ZIP
export function assembleOrchestrated(dna, sections, agentFiles, memoryContent) {
  const memoryFiles = parseMemoryFiles(memoryContent);
  const testerFile = dna.workflow?.has_tests && agentFiles.tester
    ? [{ path: 'agents/tester.md', content: agentFiles.tester }]
    : [];

  return [
    { path: 'AGENTS.md',           content: sections.orchestrator || '' },
    { path: 'agents/planner.md',   content: agentFiles.planner   || '' },
    { path: 'agents/coder.md',     content: agentFiles.coder     || '' },
    { path: 'agents/reviewer.md',  content: agentFiles.reviewer  || '' },
    ...testerFile,
    ...memoryFiles,
  ].filter(f => f.content.trim());
}
