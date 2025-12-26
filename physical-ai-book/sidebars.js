// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System',
      link: {
        type: 'generated-index',
        description: 'Introduction to ROS 2 as the robotic nervous system.',
      },
      items: [
        'module-1-robotic-nervous-system/chapter-1-ros2-overview',
        'module-1-robotic-nervous-system/chapter-2-communication-primitives',
        'module-1-robotic-nervous-system/chapter-3-ai-to-robot-bridge',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin',
      link: {
        type: 'generated-index',
        description: 'Understanding digital twin technologies for humanoid robots.',
      },
      items: [
        'module-2-digital-twin/chapter-1-physics-simulation-gazebo',
        'module-2-digital-twin/chapter-2-high-fidelity-unity',
        'module-2-digital-twin/chapter-3-simulated-sensors',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Embodied Intelligence & Control',
      link: {
        type: 'generated-index',
        description: 'How intelligence is embedded into physical systems, covering perception, decision-making, learning, and control loops that connect AI models to real robotic actuation.',
      },
      items: [
        'module-3-embodied-intelligence/chapter-1-embodied-intelligence-fundamentals',
        'module-3-embodied-intelligence/chapter-2-perception-to-action-pipelines',
        'module-3-embodied-intelligence/chapter-3-classical-vs-learning-based-control',
        'module-3-embodied-intelligence/chapter-4-reinforcement-learning-for-robotics',
        'module-3-embodied-intelligence/chapter-5-sim-to-real-transfer-strategies',
        'module-3-embodied-intelligence/chapter-6-safety-constraints-and-fail-safes',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Human–Robot Interaction & System Integration',
      link: {
        type: 'generated-index',
        description: 'How humanoid and physical AI systems integrate with humans, society, and larger system architectures.',
      },
      items: [
        'module-4-human-robot-interaction/chapter-1-hri-foundations',
        'module-4-human-robot-interaction/chapter-2-multimodal-interfaces',
        'module-4-human-robot-interaction/chapter-3-collaborative-robots-and-shared-autonomy',
        'module-4-human-robot-interaction/chapter-4-system-integration-and-middleware',
        'module-4-human-robot-interaction/chapter-5-ethical-legal-and-social-implications',
        'module-4-human-robot-interaction/chapter-6-deployment-monitoring-and-lifecycle',
      ],
    },
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
