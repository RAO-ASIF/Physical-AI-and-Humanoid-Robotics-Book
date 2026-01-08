# Quickstart Guide: Docusaurus → Cohere → Qdrant Ingestion

## Overview
This guide provides step-by-step instructions to set up and run the ingestion pipeline that extracts content from Docusaurus sites, generates embeddings with Cohere, and stores them in Qdrant.

## Prerequisites
- Python 3.11 or higher
- uv package manager
- Access to Cohere API (API key)
- Access to Qdrant Cloud or local Qdrant instance
- Deployed Docusaurus site URL

## Setup

### 1. Create the Project Structure
```bash
mkdir backend
cd backend
uv init
```

### 2. Create Environment File
Create a `.env` file in the backend directory:
```env
COHERE_API_KEY=your_cohere_api_key_here
QDRANT_URL=your_qdrant_cloud_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=book_content_chunks
DOCS_URL=https://your-deployed-docusaurus-site.com
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
```

### 3. Install Dependencies
```bash
uv pip install python-dotenv cohere qdrant-client beautifulsoup4 requests
```

### 4. Create the Application
Create `backend/main.py` with the complete ingestion pipeline implementation.

## Running the Ingestion Pipeline

### 1. Execute the Pipeline
```bash
cd backend
uv run python main.py
```

### 2. Monitor Progress
The application will output structured logs showing:
- URLs discovered from the Docusaurus site
- Content extraction progress
- Embedding generation progress
- Vector storage progress
- Final statistics and validation results

## Configuration Options

### Environment Variables
- `COHERE_API_KEY`: Your Cohere API key for embedding generation
- `QDRANT_URL`: URL of your Qdrant instance (cloud or local)
- `QDRANT_API_KEY`: API key for Qdrant authentication
- `QDRANT_COLLECTION_NAME`: Name of the collection to store embeddings
- `DOCS_URL`: Base URL of the Docusaurus site to ingest
- `CHUNK_SIZE`: Maximum size of text chunks in characters (default: 1000)
- `CHUNK_OVERLAP`: Overlap between adjacent chunks in characters (default: 100)
- `REQUEST_TIMEOUT`: Timeout for HTTP requests in seconds (default: 30)
- `RETRY_ATTEMPTS`: Number of retry attempts for failed requests (default: 3)

## Expected Output
Upon successful execution, you should see:
- All public URLs from the Docusaurus site discovered
- Content extracted and chunked with semantic boundaries respected
- Embeddings generated and stored in Qdrant
- Validation confirming all vectors are queryable
- Performance metrics showing processing time and success rates

## Troubleshooting
- If URLs are not discovered, verify the Docusaurus site has a valid sitemap.xml
- If embeddings fail, check that your Cohere API key is valid and has sufficient quota
- If Qdrant storage fails, verify your Qdrant credentials and collection permissions
- For large sites, consider increasing timeout values in configuration