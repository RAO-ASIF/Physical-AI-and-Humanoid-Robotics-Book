# Configuration Contract: Docusaurus Build Rectification

## Overview
This contract defines the required changes to the Docusaurus configuration to eliminate broken `/blog` links and ensure successful production builds for the Physical AI & Humanoid Robotics book project.

## Configuration Requirements

### Docusaurus Preset Configuration
- **File**: `physical-ai-book/docusaurus.config.js`
- **Change**: Set `blog: false` in the classic preset options
- **Current**: Blog plugin enabled by default (creating broken links)
- **Required**: Explicitly disable blog functionality with `blog: false`

### Navbar Item Removal
- **File**: `physical-ai-book/docusaurus.config.js`
- **Section**: `themeConfig.navbar.items`
- **Required**: Remove any items with `{to: '/blog', label: 'Blog', ...}`
- **Validation**: All remaining navbar items must point to valid routes

### Footer Link Removal
- **File**: `physical-ai-book/docusaurus.config.js`
- **Section**: `themeConfig.footer.links`
- **Required**: Remove any links with `{label: 'Blog', to: '/blog'}`
- **Validation**: All remaining footer links must point to valid routes

## Interface Specifications
- All configuration changes must maintain Docusaurus 3.x compatibility
- Files must be valid JavaScript/JSON syntax
- Configuration must pass Docusaurus validation during build
- Navigation changes must not break other valid routes

## Validation Criteria
- `npm run build` completes successfully with no broken link errors
- No references to `/blog` exist in the generated site
- All existing documentation routes remain accessible
- Site functions as a clean, docs-only technical book
- Module 1 and Module 2 content remains unchanged and accessible