# Ingestion Pipeline Contract

## Function: main()
The primary entrypoint for the ingestion pipeline.

### Signature
```python
def main() -> dict:
```

### Description
Executes the complete ingestion pipeline: discovers URLs from a Docusaurus site, extracts content, generates embeddings using Cohere, and stores them in Qdrant.

### Input
- Environment variables for configuration (loaded automatically)
  - `COHERE_API_KEY`: API key for Cohere service
  - `QDRANT_URL`: URL of Qdrant instance
  - `QDRANT_API_KEY`: API key for Qdrant authentication
  - `DOCS_URL`: Base URL of Docusaurus site to ingest
  - `CHUNK_SIZE`: Maximum chunk size in characters (optional, default: 1000)
  - `CHUNK_OVERLAP`: Chunk overlap in characters (optional, default: 100)

### Output
A dictionary containing ingestion statistics:
```python
{
    "status": "completed" | "failed",
    "total_urls_discovered": int,
    "urls_processed": int,
    "chunks_created": int,
    "vectors_stored": int,
    "processing_time": float,  # in seconds
    "errors": list,
    "qdrant_collection": str
}
```

### Pre-conditions
- Environment variables must be properly set
- Docusaurus site must be accessible and have a sitemap
- Cohere API must be accessible with valid credentials
- Qdrant instance must be accessible with valid credentials
- Required Python packages must be installed

### Post-conditions
- Content from all discoverable pages is embedded and stored in Qdrant
- Qdrant collection contains all generated vectors with proper metadata
- Processed content is not duplicated in subsequent runs (idempotent)
- Structured logs are output during execution

### Error Conditions
- Invalid configuration → raises ConfigurationError
- Network connectivity issues → raises NetworkError
- API authentication failures → raises AuthenticationError
- Qdrant storage failures → raises StorageError

## Function: process_ingestion_job()
Processes a complete ingestion job with error handling and progress tracking.

### Signature
```python
def process_ingestion_job(urls: list) -> IngestionJob
```

### Description
Processes a list of URLs by extracting content, generating embeddings, and storing in Qdrant.

### Input
- `urls`: List of URL strings to process

### Output
An IngestionJob object containing statistics and status.

## Function: extract_content_from_url()
Extracts clean text content from a single URL.

### Signature
```python
def extract_content_from_url(url: str) -> ContentChunk
```

### Description
Fetches a web page and extracts clean text content while preserving semantic structure.

### Input
- `url`: String URL to extract content from

### Output
A ContentChunk object with the extracted text and metadata.