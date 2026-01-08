# Research Findings: Docusaurus → Cohere → Qdrant Ingestion

## Overview
This document consolidates research findings for implementing the ingestion pipeline that discovers Docusaurus URLs, extracts content, generates embeddings with Cohere, and stores them in Qdrant.

## Decision: Technology Stack
**Rationale**: The technology stack is predetermined by the specification which requires:
- Python 3.11 as the language
- Cohere API for embeddings
- Qdrant for vector storage
- uv for package management
- Environment variables for configuration

**Alternatives considered**: Various other embedding providers (OpenAI, Hugging Face) and vector databases (Pinecone, Weaviate) were considered but Cohere and Qdrant are explicitly required by the specification.

## Decision: Single-File Architecture
**Rationale**: The specification explicitly requires all ingestion logic to live in a single file (`backend/main.py`) with a single `main()` function as the entrypoint. This simplifies deployment and distribution while meeting the functional requirements.

**Alternatives considered**: Multi-module architecture was considered for better organization but rejected due to explicit single-file constraint in the specification.

## Decision: URL Discovery Method
**Rationale**: Docusaurus sites typically provide a sitemap.xml file that lists all public URLs. This is the most reliable method for discovering all public pages on a Docusaurus site. If sitemap is not available, we can fall back to programmatic crawling.

**Alternatives considered**: Manual URL list, RSS feeds, or API endpoints. Sitemap.xml is the standard for Docusaurus sites and provides comprehensive coverage.

## Decision: Content Extraction Strategy
**Rationale**: Using BeautifulSoup4 to parse HTML and extract content while preserving semantic structure (headings, paragraphs). This allows us to respect semantic boundaries during chunking as required by the specification.

**Alternatives considered**: Regular expressions, lxml, or other parsing libraries. BeautifulSoup4 was chosen for its simplicity and effectiveness with HTML content.

## Decision: Text Chunking Algorithm
**Rationale**: Implement heading-aware chunking that respects document structure. Chunks will be created by grouping content under headings, with configurable size limits. This preserves semantic boundaries as required.

**Alternatives considered**: Fixed-size sliding windows vs. semantic chunking. Semantic chunking was chosen as it preserves meaning and context better for RAG applications.

## Decision: Qdrant Collection Structure
**Rationale**: Create a single collection with fixed vector dimensions matching Cohere's embedding model output. Payload includes all required metadata: URL, page title, section heading, chunk index, text content, and content hash for idempotency.

**Alternatives considered**: Multiple collections vs. single collection. Single collection approach was chosen for simplicity and to match the specification requirements.

## Decision: Idempotency Implementation
**Rationale**: Use content hash as part of the vector ID to ensure that identical content gets identical IDs, preventing duplication during re-runs. This makes the pipeline idempotent as required.

**Alternatives considered**: URL + chunk index combination vs. content hash. Content hash was chosen as it detects actual content changes rather than just position changes.

## Decision: Error Handling Approach
**Rationale**: Implement graceful error handling for network issues, API failures, and content extraction problems. Log errors with context and continue processing other URLs to maximize successful ingestion.

**Alternatives considered**: Fail-fast vs. graceful degradation. Graceful degradation was chosen to maximize ingestion success rates as required by success criteria.