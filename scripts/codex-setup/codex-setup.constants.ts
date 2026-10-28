// What `pnpm check:codex` (scripts/check-codex-setup.ts) runs and expects. All Codex calls work offline, logged out.
const PROVIDER_SENTINEL = 'imagery-date-config-check';

export const CODEX_SETUP = Object.freeze({
  encoding: 'utf8',
  homeVariable: 'CODEX_HOME',
  temporaryPrefix: 'imagery-date-codex-home-',
  configFile: 'config.toml',
  trustedProject: (root: string): string => `[projects.${JSON.stringify(root)}]\ntrust_level = "trusted"\n`,
  version: ['codex', '--version'],
  /** Loads every config layer strictly (unknown keys fail), then stops: the provider does not exist. */
  strictConfig: ['codex', 'exec', '--strict-config', '--ephemeral', '-c', `model_provider=${PROVIDER_SENTINEL}`, 'x'],
  configLoaded: `Model provider \`${PROVIDER_SENTINEL}\` not found`,
  rulesFile: '.codex/rules/imagery-date.rules',
  execpolicy: ['codex', 'execpolicy', 'check', '--rules'],
  commandSeparator: '--',
  argumentSeparator: ' ',
  noDecision: 'none',
  /** The exact input the model would get for a first prompt, as JSON. */
  promptInput: ['codex', 'debug', 'prompt-input', 'x'],
  instructionFiles: Object.freeze(['AGENTS.md']),
  skillsDirectory: '.agents/skills',
  skillFile: 'SKILL.md',
  skillPolicyFile: 'agents/openai.yaml',
  skillName: /^name:\s*(\S+)\s*$/m,
  explicitOnly: /allow_implicit_invocation:\s*false/,
  listedSkill: (name: string): string => `- ${name}: `,
  agentsDirectory: '.codex/agents',
  agentFile: /\.toml$/,
  agentName: /^name\s*=\s*"([^"]+)"/m,
  listedRole: (name: string): string => `${name}: {`,
  /** The gates' tests inside the default permission profile, and a host no profile allows. */
  sandboxTests: ['codex', 'sandbox', '-P', 'imagery-date', '--', 'pnpm', '-s', 'test'],
  sandbox: (profile: string): string[] => ['codex', 'sandbox', '-P', profile, '--'],
  profiles: Object.freeze(['imagery-date', 'imagery-date-record']),
  blockedHostProbe: Object.freeze([
    'node',
    '-e',
    "fetch('https://registry.npmjs.org/').then(() => process.exit(1), () => process.exit(0))",
  ]),
  hooksFile: '.codex/hooks.json',
  commandHandler: 'command',
  shell: Object.freeze(['sh', '-c']),
  /** One input per event this repository hooks, shaped like Codex's; neither changes anything. */
  hookInputs: Object.freeze<Record<string, object>>({
    SessionStart: { session_id: 'imagery-date-check', hook_event_name: 'SessionStart', source: 'startup' },
    Stop: { session_id: 'imagery-date-check', hook_event_name: 'Stop', stop_hook_active: true },
  }),
} as const);
