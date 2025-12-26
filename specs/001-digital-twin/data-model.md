# Data Model: Module 2 - The Digital Twin

## Overview
This document outlines the key conceptual entities and their relationships for Module 2 of the "Physical AI & Humanoid Robotics" book, focusing on digital twin technologies.

## Key Entities

### Digital Twin
- **Definition**: A virtual representation of a physical robot and its environment used for simulation before real-world deployment
- **Attributes**:
  - Physical robot representation
  - Environment model
  - Sensor simulation layer
  - Physics properties
- **Relationships**: Contains physics simulation, visual simulation, and sensor simulation components

### Physics Simulation
- **Definition**: Computational modeling of physical properties like gravity, friction, and collisions in a virtual environment
- **Attributes**:
  - Gravity modeling
  - Friction coefficients
  - Collision detection
  - Time simulation
  - Determinism properties
  - Fidelity parameters
- **Relationships**: Part of Digital Twin; integrates with ROS 2 through bridge mechanisms

### Visual Simulation
- **Definition**: High-fidelity rendering of environments and robot appearance for interaction and visualization
- **Attributes**:
  - Rendering quality parameters
  - Visual realism settings
  - Physical accuracy parameters
  - Synchronization mechanisms
  - HRI interface elements
- **Relationships**: Part of Digital Twin; connects to Unity for rendering; supports teleoperation interfaces

### Sensor Simulation
- **Definition**: Virtual modeling of robot sensors (LiDAR, cameras, IMUs) to provide perception data in simulation
- **Attributes**:
  - LiDAR simulation parameters
  - Camera properties (RGB-D, depth)
  - IMU characteristics
  - Noise modeling
  - Distortion parameters
  - Limitation modeling
- **Relationships**: Part of Digital Twin; provides perception data; connects to real sensor specifications

## Relationships

```
Digital Twin
├── contains Physics Simulation
├── contains Visual Simulation
└── contains Sensor Simulation
```

## State Transitions

### Digital Twin States
- **Configuration**: Setting up the simulation environment and parameters
- **Initialization**: Loading robot models, environment, and sensor configurations
- **Simulation**: Running the physics, visual, and sensor simulation loops
- **Evaluation**: Assessing simulation results and comparing with real-world expectations

## Validation Rules

### From Functional Requirements
- **FR-002**: Digital Twin must explain the role in Physical AI and humanoid robotics
- **FR-003-FR-006**: Physics Simulation must cover Gazebo architecture and ROS 2 integration
- **FR-007-FR-011**: Visual Simulation must cover Unity's role in robotics and HRI
- **FR-012-FR-016**: Sensor Simulation must cover all specified sensor types and limitations

### Content Constraints
- **FR-019-FR-022**: No installation guides, full tutorials, or NVIDIA Isaac content
- **FR-023**: Must be formatted as Docusaurus-compatible Markdown/MDX
- **FR-024**: Must use technical, instructional, precise tone