---
name: ashai-intern-ui
description: Understand and improve the Ashai intern-facing web UI using the project screenshots and source code. Use for mobile UI reviews, intern dashboard, time tracking, daily reports, requests, leads, and navigation changes.
---

# Ashai Intern UI

Use this skill when working on the intern-facing Ashai Apparel Smart Hub interface. The workspace may include mobile screenshots in `internUI/`; inspect those and the actual application source before proposing or changing the UI.

When asked to create the app, build a usable, responsive intern-facing web app grounded in the screenshots and available project requirements, not just a static screenshot mockup. If application source already exists, extend its current framework and architecture. If the repository is only a set of screenshots or is otherwise empty, scaffold a suitable web app using a framework supported by Vercel and explain the stack choice. Keep authentication, role-based access, and real company data clearly separated from demo UI; do not invent production credentials, APIs, or company policies.

Prepare the app so it can be reviewed in GitHub and deployed through Vercel: keep project files organized, include the required package/build configuration, document required environment variable names without secrets, and make the production build configuration compatible with the chosen framework. Use the repository's existing Git setup if present. Do not create a remote repository, push commits, connect a Vercel account, or publish a deployment unless the user explicitly asks. If deployment is requested, finish the code and deployment configuration first, then ask for any account, repository, environment, or production details that are unavailable before performing external publishing actions.

## Product context

The screenshots show an intern account using a dark interface with teal accents and a bottom navigation bar. Visible areas include:

- **Home:** intern greeting, phone notification prompt, assigned work links, summary cards, and quick links.
- **Oras:** time-in/time-out, hours summary, daily work records, work area selection, and accomplishment reports.
- **Request:** Leave, Materials, Cash Advance, and Time-in correction forms, submission guidance, and the intern's request list.
- **Leads:** client lead entry, follow-up details, product/status, conversation notes, search, and an empty state.
- **More:** intern profile, searchable/expandable work knowledge categories, and sign out.

These screenshots may be duplicate views or different scroll positions of the same page. Treat this as context from one visible intern account, not proof that all interns have identical assignments, data, or permissions.

## Workflow

1. **Understand the evidence.** Review each available screenshot. Group repeated screens and scroll positions; note the visible page, controls, selected navigation item, and any clipping or overlap. Distinguish clearly visible facts from guesses. If screenshot filenames are present, use them when describing findings.
2. **Trace the UI in source.** Find the framework, routes, shared layout, navigation, page components, styles, and role/permission checks that implement the intern experience. Follow the existing project conventions and data flow.
3. **Compare before changing.** Report concrete mismatches or usability problems supported by both the screenshots and source. Account for narrow phone widths, browser chrome, scrolling, fixed navigation, readable contrast, touch targets, labels, and keyboard/screen-reader behavior where relevant. Treat colored focus/selection borders in screenshots as uncertain until verified in code.
4. **Keep the change focused.** Prefer a small mobile-first fix that fits the existing Ashai visual style. Preserve business rules, API behavior, stored data, and permission boundaries. Do not redesign unrelated pages or infer a new workflow from screenshots alone.
5. **Implement and summarize.** When asked to fix the UI or create the app, make the relevant code changes after identifying the scope. If essential context is unavailable or a change would alter business behavior or access rules, explain the uncertainty and ask before making that part of the change. Summarize the issue or app scope, files changed, how to run/build it, and verification performed. Do not claim visual or runtime verification unless it was actually performed.

## Project artifacts

When `internUI/` exists, inspect its images directly. Screens to recognize include the intern dashboard, time tracking and daily reports, leave request form/status, lead form/list, and More/knowledge menu. Do not assume the screenshots show every intern role or the latest app state; verify behavior and account-specific content in the code.
