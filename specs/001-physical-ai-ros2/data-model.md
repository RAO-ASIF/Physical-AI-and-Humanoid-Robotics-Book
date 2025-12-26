# Data Model: Physical AI & Humanoid Robotics — Module 1

## Entities

### Module Structure
- **Name**: Module 1 - The Robotic Nervous System
- **Description**: Educational content module containing three progressive chapters
- **Relationships**: Contains three Chapter entities
- **Validation**: Must contain exactly three chapters as specified

### Chapter
- **Name**: Chapter title
- **Description**: Educational content for a specific ROS 2 concept
- **Fields**:
  - title: string (required)
  - content: MDX format text (required)
  - order: integer (1-3, required, unique)
  - learning_objectives: array of strings
  - target_audience: array of strings (software engineers, AI practitioners, students)
- **Relationships**: Belongs to one Module Structure
- **Validation**: Order must be unique within module, content must follow accessibility guidelines

### ROS 2 Concepts
- **Name**: Concept identifier (e.g., "Nodes", "Topics", "Services", "Actions")
- **Description**: Core ROS 2 architectural element
- **Fields**:
  - concept_type: string (Node, Topic, Service, Action, etc.)
  - definition: string (required)
  - use_cases: array of strings
  - examples: array of code examples
- **Relationships**: Referenced by one or more Chapters
- **Validation**: Must have clear definition and relevant examples

### Communication Patterns
- **Name**: Pattern identifier (e.g., "Pub-Sub", "Client-Server", "Action-based")
- **Description**: How ROS 2 components interact
- **Fields**:
  - pattern_type: string (required)
  - description: string (required)
  - when_to_use: string (required)
  - humanoid_examples: array of practical examples
- **Relationships**: Referenced by Chapter 2
- **Validation**: Must include practical examples for humanoid robots

### AI-Robot Bridge
- **Name**: Integration method (e.g., "rclpy Python agents")
- **Description**: How AI agents connect to robot hardware
- **Fields**:
  - integration_method: string (required)
  - implementation_language: string (required)
  - urdf_integration: boolean
  - controller_types: array of strings
- **Relationships**: Referenced by Chapter 3
- **Validation**: Must include valid rclpy examples and URDF compatibility