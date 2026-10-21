# Proposed December 2026 roadmap

Planning baseline: 21 October 2026. These are proposed goals, not released capabilities or a promise of GSoC participation.

## Product focus

Make Anastomotic a dependable open-source desktop assistant for people who repeatedly turn local files into useful outputs and want to choose their AI provider. Start with researchers, students and individual developers; validate this audience with actual users.

Ship three reproducible workflows with sample inputs, expected outputs and walkthroughs:

1. Summarize supported text/Markdown files into a report identifying its source files.
2. Organize a sample folder: explain proposed moves, request approval and show resulting paths. Establish recovery steps before promoting it for valuable files.
3. Research a topic in the browser and save a Markdown brief with inspectable source links.

Do not advertise advanced features as dependable without integration tests and successful manual runs. Avoid adding providers simply to increase the provider count.

## Milestones

| Target         | Deliverable              | Acceptance evidence                                                                                                                     |
| -------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 21–31 October  | Reproducible development | Clean Windows/Linux setup; documented Node/Electron ABI handling; passing applicable checks; CI covers web, daemon and desktop          |
| 1–15 November  | First successful task    | A new user configures one tested cloud provider or local model, runs the sample summary task and locates output without maintainer help |
| 16–30 November | Reliable workflows       | Ten fixture runs per promoted workflow/provider combination; record failures, denial, cancellation, duration and cost where available   |
| 1–15 December  | External beta            | Recruit 5–10 testers; resolve setup and first-task blockers; publish tested OS/model combinations                                       |
| 16–31 December | Documented release       | Tested installers, changelog, recovery notes, three working examples, no known critical blockers and contributor tasks with reviewers   |

Suggested targets: 90% success across documented fixtures, no writes after explicit denial in supported test scenarios, and at least 4 of 5 new testers completing the first workflow unaided. These are goals, not current performance claims. Measure weekly reuse through opt-in interviews.

## Release blockers

- Native SQLite ABI switching and inconsistent toolchain versions across CI, containers and docs.
- Existing web integration and Windows desktop integration test failures; distinguish test assumptions from product defects.
- End-to-end permission denial, cancellation, provider failure and daemon restart behavior.
- Accurate privacy/isolation descriptions, verified downloads and packaging on every promoted platform.
- Keyboard-accessible onboarding, readable errors and a clear output location.

## Contributor foundation

Build a public community with small reviewed contributions before pursuing a formal mentoring program. Maintainers need primary/backup reviewers, realistic available time, a conduct/reporting process and a maintained discussion channel. Do not promise response times without confirmed capacity.

Every contributor issue should include a user problem, relevant files, expected behavior, verification steps, difficulty and reviewer. Use `good first issue` only after reproducing the problem and confirming it does not require paid credentials or broad architecture knowledge.

| Starter candidate          | Starting points                           | Completion criteria                                              |
| -------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Portable path tests        | Desktop CLI/system-path integration tests | Cover Windows/POSIX without assuming `/usr/local/bin` exists     |
| Sample summary walkthrough | Docs and sample text fixtures             | Fresh tester produces and finds a report; data flow is explained |
| Tested local model guide   | Provider setup/tool support checks        | Record actual hardware/model/version and limitations             |
| Keyboard onboarding audit  | Web onboarding/settings                   | Required controls work with keyboard and visible focus           |

These are triage candidates, not issues already opened or assigned.

## Larger mentored project ideas

| Idea                         | Skills/scope                            | Milestones                                                                                                         |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Workflow reliability harness | TypeScript, Vitest/Playwright           | Define success schema; implement fixtures; cover denial/cancel/error; publish repeatable results                   |
| Native runtime setup         | Node, Electron, native dependencies, CI | Reproduce both ABIs; isolate or explicitly switch targets; verify Node tests and Electron startup on Windows/Linux |
| Permission/isolation audit   | Advanced OS/process/security knowledge  | Map enforcement paths; adversarial fixtures; agreed boundary fixes; report platform limitations                    |
| Accessible first task        | React, accessibility, user testing      | Audit; implement one complete flow; keyboard/screen-reader checks; external user observations                      |

Assign named mentors, estimated effort and a bounded proposal before advertising these as formally mentored or funded. Small prerequisite contributions should teach the codebase; avoid large unpaid application exercises.

GSoC selects mentoring organizations through an application process. December can establish a community and ideas list; verify the next official cycle before planning an application. References: [How GSoC works](https://summerofcode.withgoogle.com/how-it-works), [mentor guide](https://google.github.io/gsocguides/mentor/).
