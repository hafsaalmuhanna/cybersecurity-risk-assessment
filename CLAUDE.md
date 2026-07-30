# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this repository is

This is a **documentation-only** project. It presents a practical cybersecurity
risk assessment for a fictional organization, written as a set of Markdown
documents. There is **no application code, build system, dependency manifest,
or test suite** — the deliverable *is* the prose.

Treat every task here as technical writing and information architecture, not
software engineering. Do not scaffold a build, add package managers, or
introduce tooling unless the user explicitly asks for it.

## Repository layout

```
.
├── README.md         # The primary risk assessment document
├── nist-mapping.md   # Maps identified risks to NIST CSF functions
└── CLAUDE.md         # This file
```

- **`README.md`** — the main assessment. Organized into fixed sections:
  Project Introduction, Scope and Assets, Risk Analysis, Risk Evaluation,
  Mitigation Recommendations, and Conclusion and Next Steps.
- **`nist-mapping.md`** — a companion document mapping risks to the five NIST
  Cybersecurity Framework (CSF) functions: Identify, Protect, Detect, Respond,
  Recover.

When adding new content, prefer extending these documents or adding a new
top-level `*.md` file over creating nested directories — the flat structure is
intentional for a small, readable assessment.

## Content conventions

- **Format:** GitHub-flavored Markdown throughout.
- **Headings:** One `#` H1 title per file, `##` for major sections, `###` for
  subsections. Match the existing heading style when adding sections.
- **Lists:** Use `-` for bullets. Keep items short and scannable.
- **Risk levels:** Risks are categorized as **low / medium / high**, derived
  from asset value, threat likelihood, and potential business impact. Reuse
  this three-tier scheme rather than inventing a new scale.
- **Framework alignment:** Security controls and recommendations should align
  with the **NIST Cybersecurity Framework (CSF)**. When you introduce a new
  risk or control in `README.md`, add the corresponding mapping to
  `nist-mapping.md` so the two documents stay in sync.
- **Tone:** Professional, concise, and vendor-neutral. This is an educational /
  demonstration assessment for a fictional organization — keep it generic and
  avoid referencing real systems, credentials, or organizations.
- **Scope of assets** currently covered: user accounts and credentials,
  internal network systems, customer data (PII), and business-critical
  applications. Keep new content consistent with this scope.

## Working in this repo

- There is nothing to build, run, lint, or test. "Verifying" a change means
  proofreading the Markdown and confirming it renders correctly (valid
  headings, lists, and links).
- Keep `README.md` and `nist-mapping.md` consistent with each other. A change
  to the risks or controls in one usually implies an update to the other.
- Preserve the existing section ordering in `README.md` unless the user asks to
  reorganize it.

## Git workflow

- Default branch: `main`.
- Make focused commits with clear, descriptive messages (e.g.
  `Add ransomware to risk analysis` rather than `update`).
- Do not open a pull request unless the user explicitly requests one.

## Possible future direction

The assessment's own "Next Steps" note directions that may become real tasks:
automating risk scoring, integrating real vulnerability scan data, and deeper
alignment with frameworks such as NIST CSF. If asked to pursue any of these,
confirm whether the user wants to keep the project documentation-only or
introduce actual tooling before adding code.
