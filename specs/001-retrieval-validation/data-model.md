# Data Model: Retrieval & Pipeline Validation

## Overview
Data models for the retrieval and validation layer that queries Qdrant vector database to verify embeddings, metadata integrity, and similarity search behavior.

## Key Entities

### RetrievedChunk
Represents a segment of text retrieved from Qdrant with all required metadata.

```python
class RetrievedChunk(BaseModel):
    id: str  # Qdrant point ID
    url: str  # Source URL of the content
    page_title: str  # Title of the page
    section_heading: str  # Section heading if applicable
    chunk_index: int  # Index of the chunk
    text: str  # The actual text content of the chunk
    similarity_score: float  # Similarity score from the search
    vector: Optional[List[float]] = None  # The embedding vector (optional)
```

### SearchQuery
Contains the query text and parameters for executing similarity search against Qdrant.

```python
class SearchQuery(BaseModel):
    text: str  # The query text to search for
    top_k: int = 5  # Number of results to return
    score_threshold: Optional[float] = None  # Minimum similarity threshold
    filter_by_url: Optional[str] = None  # Optional URL to filter by
    filter_by_section: Optional[str] = None  # Optional section heading to filter by
    distance_metric: str = "cosine"  # Distance metric to use for search
```

### ValidationResult
Represents the outcome of validating retrieved chunks, including success status, metadata validation, and any detected issues.

```python
class ValidationResult(BaseModel):
    success: bool  # Overall validation success
    total_results: int  # Total number of results retrieved
    valid_results: int  # Number of results that passed validation
    invalid_results: int  # Number of results that failed validation
    issues: List[str]  # List of validation issues found
    metadata_integrity: bool  # Whether all metadata fields are present and valid
    semantic_relevance: bool  # Whether results are semantically relevant
    execution_time: float  # Time taken for the validation process
```

### RetrievalConfig
Configuration for the retrieval system loaded from environment variables.

```python
class RetrievalConfig(BaseModel):
    qdrant_url: str  # Qdrant URL
    qdrant_api_key: Optional[str]  # Qdrant API key (optional for local)
    qdrant_collection_name: str  # Name of the collection to search
    cohere_api_key: str  # Cohere API key
    default_top_k: int = 5  # Default number of results to return
    default_score_threshold: Optional[float] = None  # Default minimum similarity threshold
    validate_metadata: bool = True  # Whether to validate metadata integrity
```

### QueryResult
Wrapper for the results of a retrieval operation.

```python
class QueryResult(BaseModel):
    query: SearchQuery  # The original query
    retrieved_chunks: List[RetrievedChunk]  # List of retrieved chunks
    validation_result: ValidationResult  # Validation of the results
    execution_log: List[str]  # Log of the execution steps
```

## Relationships

- A `SearchQuery` generates one `QueryResult`
- A `QueryResult` contains multiple `RetrievedChunk` instances
- A `QueryResult` includes one `ValidationResult`
- A `ValidationResult` references the `RetrievedChunk` instances it validated
- `RetrievalConfig` is used to initialize the retrieval system

## Constraints

- All required metadata fields (url, page_title, section_heading, chunk_index, text) must be present in each `RetrievedChunk`
- `similarity_score` must be between 0 and 1
- `chunk_index` must be a non-negative integer
- `top_k` must be a positive integer
- URLs must follow standard URL format