---
description: "Task list for Docusaurus Build Rectification implementation"
---

# Tasks: Docusaurus Build Rectification

**Input**: Design documents from `/specs/002-docusaurus-build-rectification/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Configuration files will be in the physical-ai-book/ directory
- Files will be JavaScript/JSON format for Docusaurus compatibility

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project preparation and verification

- [X] T001 Verify current Docusaurus build fails with broken links
- [X] T002 [P] Backup current docusaurus.config.js file
- [X] T003 [P] Identify all references to `/blog` in configuration files
- [X] T004 Create backup of current configuration files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Update docusaurus.config.js to set blog: false in classic preset
- [X] T006 Verify blog plugin is properly disabled in configuration
- [X] T007 Test that build process no longer attempts to build blog routes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Successful Production Build (Priority: P1) 🎯 MVP

**Goal**: Fix the Docusaurus production build to complete successfully without broken link errors so that the documentation site can be deployed to GitHub Pages

**Independent Test**: Running `npm run build` completes without broken link errors

### Implementation for User Story 1

- [X] T008 [US1] Remove navbar item referencing `/blog` from docusaurus.config.js
- [X] T009 [US1] Remove footer link referencing `/blog` from docusaurus.config.js
- [X] T010 [US1] Verify no `/blog` references remain in navbar configuration
- [X] T011 [US1] Verify no `/blog` references remain in footer configuration
- [X] T012 [US1] Run build process to verify no broken link errors exist
- [X] T013 [US1] Validate that `/blog` route is not accessible in generated site

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Clean Navigation (Priority: P1)

**Goal**: Ensure the navigation only contains valid links so that users don't encounter 404 errors when browsing the site

**Independent Test**: All navigation links point to existing pages and don't result in 404 errors

### Implementation for User Story 2

- [X] T014 [US2] Audit all navbar links to ensure they point to valid routes
- [X] T015 [US2] Audit all footer links to ensure they point to valid routes
- [X] T016 [US2] Verify no broken navigation links exist in generated site
- [X] T017 [US2] Test navigation functionality in local development server
- [X] T018 [US2] Validate all internal links resolve correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Docs-Only Functionality (Priority: P1)

**Goal**: Ensure the site functions as a clean documentation-only resource without unnecessary blog functionality so that readers can focus on the technical content

**Independent Test**: The site only contains documentation-related functionality with no blog features

### Implementation for User Story 3

- [X] T019 [US3] Verify blog plugin is completely disabled in docusaurus.config.js
- [X] T020 [US3] Confirm no blog-related routes are generated in the site
- [X] T021 [US3] Validate that site only contains documentation features
- [X] T022 [US3] Verify no blog functionality appears in navigation or UI
- [X] T023 [US3] Confirm all documentation modules remain accessible

**Checkpoint**: At this point, User Stories 1, 2, and 3 should all be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T024 [P] Run full production build to validate all changes work together
- [X] T025 [P] Verify Module 1 and Module 2 content remains unchanged and accessible
- [X] T026 [P] Test site locally to ensure all navigation works properly
- [X] T027 [P] Validate GitHub Pages deployment readiness
- [X] T028 [P] Clean up any backup files created during the process
- [X] T029 [P] Run final build validation to confirm no broken links exist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all configuration updates together:
Task: "Remove navbar item referencing /blog from docusaurus.config.js"
Task: "Remove footer link referencing /blog from docusaurus.config.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently by running `npm run build`
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence