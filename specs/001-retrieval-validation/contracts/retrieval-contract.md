# API Contracts: Retrieval & Pipeline Validation

## Overview
Contract definitions for the retrieval and validation layer that queries Qdrant vector database to verify embeddings, metadata integrity, and similarity search behavior.

## Public Interface

### main()
The primary entry point for the retrieval and validation system.

#### Signature
```python
def main(query_text: Optional[str] = None) -> int
```

#### Inputs
- `query_text` (Optional[str]): Text to search for in the vector database
  - If None, uses a default test query
  - Must be a non-empty string when provided
  - Maximum length: 1000 characters

#### Outputs
- `int`: Exit code (0 for success, non-zero for failure)

#### Contract
- Validates environment variables before execution
- Initializes Qdrant and Cohere clients
- Executes retrieval with default parameters if not specified
- Performs validation on retrieved results
- Logs query execution details
- Returns appropriate exit code based on success/failure

## Core Services

### retrieve_chunks()
Executes similarity search against Qdrant and returns retrieved chunks.

#### Signature
```python
async def retrieve_chunks(query: SearchQuery, config: RetrievalConfig) -> List[RetrievedChunk]
```

#### Inputs
- `query: SearchQuery`: Contains query text and search parameters
- `config: RetrievalConfig`: Configuration for the retrieval system

#### Outputs
- `List[RetrievedChunk]`: List of retrieved chunks with metadata

#### Contract
- Generates embedding for query text using Cohere API
- Performs similarity search in Qdrant collection specified in config
- Applies filtering by URL or section heading if specified in query
- Returns top_k results as specified in query
- Includes payload data with all required metadata fields
- Raises appropriate exceptions on failure

#### Error Conditions
- Raises `ConnectionError` if unable to connect to Qdrant
- Raises `APIError` if Cohere API call fails
- Raises `ValueError` if query parameters are invalid

### validate_retrieved_chunks()
Validates the integrity and relevance of retrieved chunks.

#### Signature
```python
def validate_retrieved_chunks(chunks: List[RetrievedChunk], query_text: str) -> ValidationResult
```

#### Inputs
- `chunks: List[RetrievedChunk]`: List of retrieved chunks to validate
- `query_text: str`: Original query text for relevance checking

#### Outputs
- `ValidationResult`: Result of the validation process

#### Contract
- Checks that each chunk has all required metadata fields
- Validates data types of each field
- Assesses semantic relevance of chunks to query
- Counts valid vs invalid results
- Measures execution time
- Logs any validation issues found

### log_query_execution()
Logs details of query execution for observability.

#### Signature
```python
def log_query_execution(query: SearchQuery, result: QueryResult)
```

#### Inputs
- `query: SearchQuery`: The original search query
- `result: QueryResult`: The result of the query execution

#### Outputs
- None (produces logging output)

#### Contract
- Logs query text
- Logs number of vectors searched (total collection count)
- Logs number of results returned
- Logs top results with URL, section heading, chunk index, and text preview
- Logs execution time
- Logs any errors or warnings encountered

## Configuration Validation

### validate_environment()
Validates that all required environment variables are present.

#### Signature
```python
def validate_environment() -> RetrievalConfig
```

#### Inputs
- None (reads from environment variables)

#### Outputs
- `RetrievalConfig`: Validated configuration object

#### Contract
- Reads environment variables: QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION_NAME, COHERE_API_KEY
- Validates that required variables are present and not empty
- Creates and returns a RetrievalConfig object
- Raises ValueError if required variables are missing

## Internal Functions

### generate_query_embedding()
Generates embedding for query text using Cohere API.

#### Signature
```python
async def generate_query_embedding(text: str, config: RetrievalConfig) -> List[float]
```

#### Inputs
- `text: str`: Text to generate embedding for
- `config: RetrievalConfig`: Configuration with Cohere API key

#### Outputs
- `List[float]`: Embedding vector

#### Contract
- Calls Cohere API to generate embedding for the input text
- Uses the same model that was used during ingestion for consistency
- Returns the embedding as a list of floats
- Handles API errors appropriately

### build_qdrant_filter()
Builds Qdrant filter object based on query parameters.

#### Signature
```python
def build_qdrant_filter(filter_by_url: Optional[str], filter_by_section: Optional[str]) -> Optional[Filter]
```

#### Inputs
- `filter_by_url: Optional[str]`: URL to filter by
- `filter_by_section: Optional[str]`: Section heading to filter by

#### Outputs
- `Optional[Filter]`: Qdrant Filter object or None if no filters specified

#### Contract
- Creates a Qdrant Filter object with conditions for URL and/or section heading
- Returns None if no filters are specified
- Properly structures the filter for Qdrant client

## Error Handling Contract

### Expected Exceptions
- `ConnectionError`: Network connectivity issues with Qdrant or Cohere
- `APIError`: API-specific errors from Qdrant or Cohere
- `ValueError`: Invalid input parameters
- `ConfigurationError`: Missing or invalid configuration

### Error Response
- All functions must provide meaningful error messages
- Network errors should include retry recommendations where applicable
- Configuration errors should specify which variables are missing
- Failed operations should clean up any partial state

## Performance Contract

### Latency Expectations
- Query execution should complete within 30 seconds under normal conditions
- Individual API calls should have appropriate timeouts
- Bulk operations should be processed efficiently

### Resource Usage
- Memory usage should be proportional to result size
- No resource leaks in long-running operations
- Efficient handling of large result sets