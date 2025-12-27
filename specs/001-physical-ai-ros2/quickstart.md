# Quickstart: Physical AI & Humanoid Robotics — Module 1

## Prerequisites

1. **Node.js**: Install LTS version (18.x or 20.x)
2. **npm**: Comes with Node.js
3. **Git**: For version control
4. **Text Editor**: VS Code or similar with MDX support

## Setup

1. **Initialize Docusaurus Project**
   ```bash
   npx create-docusaurus@latest physical-ai-book classic
   cd physical-ai-book
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Create Module Directory**
   ```bash
   mkdir -p docs/module-1-robotic-nervous-system
   ```

4. **Create Chapter Files**
   ```bash
   touch docs/module-1-robotic-nervous-system/chapter-1-ros2-overview.mdx
   touch docs/module-1-robotic-nervous-system/chapter-2-communication-primitives.mdx
   touch docs/module-1-robotic-nervous-system/chapter-3-ai-to-robot-bridge.mdx
   ```

## Basic Configuration

1. **Update docusaurus.config.js** to include the new module in the sidebar navigation

2. **Create category configuration** in `docs/module-1-robotic-nervous-system/_category_.json`:
   ```json
   {
     "label": "Module 1: The Robotic Nervous System",
     "position": 1,
     "link": {
       "type": "generated-index",
       "description": "Introduction to ROS 2 as the robotic nervous system."
     }
   }
   ```

## Writing Content

1. **Chapter 1**: Focus on conceptual overview of ROS 2 in Physical AI
2. **Chapter 2**: Detail communication primitives with humanoid examples
3. **Chapter 3**: Bridge AI agents to robot bodies using rclpy and URDF

## Validation

1. **Check build**: `npm run build`
2. **Verify navigation**: Ensure all chapters appear in sidebar
3. **Accessibility**: Confirm WCAG 2.1 AA compliance
4. **Content accuracy**: Validate against ROS 2 Humble Hawksbill documentation