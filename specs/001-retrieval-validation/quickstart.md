# Quickstart Guide: Retrieval & Pipeline Validation

## Overview
This guide will help you quickly set up and run the retrieval validation system to verify your Qdrant vector database.

## Prerequisites
- Python 3.11+
- pip package manager
- Access to Qdrant (cloud or local instance)
- Cohere API key
- Existing vector database populated by ingestion pipeline

## Setup

### 1. Environment Configuration
Create a `.env` file in the project root with the following variables:

```bash
QDRANT_URL=https://your-qdrant-instance.com # For cloud instance
# OR
QDRANT_URL=localhost:6333 # For local instance

QDRANT_API_KEY=your-qdrant-api-key # Required for cloud, optional for local
QDRANT_COLLECTION_NAME=book_content_chunks # Should match your ingestion collection
COHERE_API_KEY=your-cohere-api-key
```

### 2. Install Dependencies
```bash
pip install python-dotenv qdrant-client cohere pydantic requests beautifulsoup4
```

### 3. Run the Retrieval Validation
```bash
cd backend
python retrieve.py
```

Or with a custom query:
```bash
python retrieve.py --query "your search query here"
```

## Usage Examples

### Basic Retrieval
```bash
python retrieve.py
```
This will run with default settings and a test query.

### Custom Query
```bash
python retrieve.py --query "What is physical AI?"
```

### Custom Parameters
```bash
python retrieve.py --query "neural networks" --top_k 10 --score_threshold 0.5
```

## Expected Output
The system will output:
- Query text used
- Number of vectors searched
- Number of results returned
- Top results with URL, section heading, chunk index, and text preview
- Validation results confirming metadata integrity

## Troubleshooting

### Common Issues
1. **Connection errors**: Verify QDRANT_URL and QDRANT_API_KEY are correct
2. **Missing metadata**: Ensure your ingestion pipeline stored all required fields
3. **No results**: Check that your collection contains data and query is appropriate

### Validation Failures
- Check that all required metadata fields (url, page_title, section_heading, chunk_index, text) are present in your Qdrant collection
- Verify Cohere API key is valid and has sufficient quota
- Confirm collection name matches between ingestion and retrieval