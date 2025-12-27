# Data Model: Docusaurus Build Rectification

## Overview
This document outlines the key configuration elements and their relationships for the Docusaurus build rectification project, focusing on eliminating broken `/blog` links from the Physical AI & Humanoid Robotics book site.

## Key Entities

### Docusaurus Configuration
- **Definition**: The main configuration file (docusaurus.config.js) that controls site behavior and plugin settings
- **Attributes**:
  - Preset settings (classic preset with blog: false)
  - Navbar items (without /blog references)
  - Footer links (without /blog references)
  - Theme settings (custom CSS, etc.)
- **Relationships**: Contains all site-wide configuration elements

### Navigation Elements
- **Definition**: Components that provide site navigation (navbar and footer)
- **Attributes**:
  - Navbar items (links to valid routes only)
  - Footer links (valid internal or external links only)
  - Navigation positioning (left, right, etc.)
- **Relationships**: Part of Docusaurus Configuration; links to valid site routes

### Build Process
- **Definition**: The npm run build command that validates and generates the static site
- **Attributes**:
  - Link validation (strict broken link checking)
  - Static site generation
  - Route verification
- **Relationships**: Validates Docusaurus Configuration and Navigation Elements

### Documentation Routes
- **Definition**: Valid routes that serve the technical book content
- **Attributes**:
  - Module 1 routes (existing, working routes)
  - Module 2 routes (existing, working routes)
  - Intro and landing pages
- **Relationships**: Connected to Navigation Elements; referenced in site structure

## Relationships

```
Docusaurus Configuration
├── contains Navigation Elements
├── defines Build Process settings
└── manages Documentation Routes
```

## State Transitions

### Configuration States
- **Initial State**: Configuration with blog plugin enabled and /blog links present
- **Transition**: Apply rectification changes (disable blog, remove links)
- **Final State**: Configuration with blog disabled and only valid links present

## Validation Rules

### From Functional Requirements
- **FR-001**: Docusaurus configuration must set blog: false in the classic preset
- **FR-002-FR-003**: Navigation Elements must not contain any links to `/blog`
- **FR-004-FR-005**: Build Process must complete successfully with no broken link errors
- **FR-006**: Site must not expose any `/blog` routes
- **FR-007**: onBrokenLinks setting must remain strict (not ignored)

### Content Constraints
- **FR-008-FR-010**: Module 1 and Module 2 content must remain unchanged and accessible
- **FR-009-FR-010**: Site must function as a docs-only technical book ready for deployment