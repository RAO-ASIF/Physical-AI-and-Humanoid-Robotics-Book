# Quickstart: Module 3 & Module 4 Implementation

## Overview
Quickstart guide for implementing Module 3 (Embodied Intelligence & Control) and Module 4 (Human–Robot Interaction & System Integration).

## Prerequisites

- Node.js LTS (18+ or 20+)
- npm package manager
- Docusaurus 3.x development environment
- Git for version control
- Access to existing project structure

## Setup Environment

1. **Clone the repository** (if starting fresh):
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. **Install dependencies**:
   ```bash
   cd physical-ai-book
   npm install
   ```

3. **Verify existing build works**:
   ```bash
   npm run build
   ```

## Implementation Steps

### Phase 1: Module 3 Creation

1. **Create Module 3 directory structure**:
   ```bash
   mkdir -p docs/module-3-embodied-intelligence
   ```

2. **Create individual chapter files**:
   ```bash
   touch docs/module-3-embodied-intelligence/chapter-1-embodied-intelligence-fundamentals.mdx
   touch docs/module-3-embodied-intelligence/chapter-2-perception-to-action-pipelines.mdx
   touch docs/module-3-embodied-intelligence/chapter-3-classical-vs-learning-based-control.mdx
   touch docs/module-3-embodied-intelligence/chapter-4-reinforcement-learning-for-robotics.mdx
   touch docs/module-3-embodied-intelligence/chapter-5-sim-to-real-transfer-strategies.mdx
   touch docs/module-3-embodied-intelligence/chapter-6-safety-constraints-and-fail-safes.mdx
   ```

### Phase 2: Module 4 Creation

1. **Create Module 4 directory structure**:
   ```bash
   mkdir -p docs/module-4-human-robot-interaction
   ```

2. **Create individual chapter files**:
   ```bash
   touch docs/module-4-human-robot-interaction/chapter-1-hri-foundations.mdx
   touch docs/module-4-human-robot-interaction/chapter-2-multimodal-interfaces.mdx
   touch docs/module-4-human-robot-interaction/chapter-3-collaborative-robots-and-shared-autonomy.mdx
   touch docs/module-4-human-robot-interaction/chapter-4-system-integration-and-middleware.mdx
   touch docs/module-4-human-robot-interaction/chapter-5-ethical-legal-and-social-implications.mdx
   touch docs/module-4-human-robot-interaction/chapter-6-deployment-monitoring-and-lifecycle.mdx
   ```

### Phase 3: Navigation Integration

1. **Update sidebar configuration** in `sidebars.js`:
   - Add Module 3 category with 6 chapters
   - Add Module 4 category with 6 chapters
   - Ensure proper ordering with existing modules

2. **Verify navigation links** work correctly

### Phase 4: Validation

1. **Run local development server**:
   ```bash
   npm run start
   ```

2. **Build and validate**:
   ```bash
   npm run build
   ```

3. **Check for broken links** and fix any issues

## Content Guidelines

- Follow the style and formatting of existing modules
- Include relevant code examples and diagrams where appropriate
- Maintain technical accuracy with authoritative sources
- Ensure progressive complexity in explanations
- Add proper cross-references to related content

## Deployment

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add Module 3 and Module 4 documentation"
   git push origin 003-physical-ai-modules-3-4
   ```

2. **Deploy to GitHub Pages** following existing deployment process