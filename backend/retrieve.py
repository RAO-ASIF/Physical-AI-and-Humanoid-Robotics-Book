#!/usr/bin/env python3
"""
Retrieval and Validation Layer for RAG Chatbot

This module implements a retrieval system that queries the Qdrant vector database
to verify embeddings, metadata integrity, and similarity search behavior.
"""

import os
import asyncio
import logging
from typing import List, Optional, Dict, Any
from urllib.parse import urlparse

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
from pydantic import BaseModel, Field, ValidationError
import requests
from bs4 import BeautifulSoup


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Data Models
class RetrievalConfig(BaseModel):
    """Configuration for the retrieval system loaded from environment variables."""
    qdrant_url: str
    qdrant_api_key: Optional[str] = None
    qdrant_collection_name: str
    cohere_api_key: str
    default_top_k: int = 5
    default_score_threshold: Optional[float] = None
    validate_metadata: bool = True


class RetrievedChunk(BaseModel):
    """Represents a segment of text retrieved from Qdrant with all required metadata."""
    id: str  # Qdrant point ID
    url: str  # Source URL of the content
    page_title: str  # Title of the page
    section_heading: str  # Section heading if applicable
    chunk_index: int  # Index of the chunk
    text: str  # The actual text content of the chunk
    similarity_score: float  # Similarity score from the search
    vector: Optional[List[float]] = None  # The embedding vector (optional)


class SearchQuery(BaseModel):
    """Contains the query text and parameters for executing similarity search against Qdrant."""
    text: str  # The query text to search for
    top_k: int = Field(default=5, ge=1, le=100)  # Number of results to return, between 1 and 100
    score_threshold: Optional[float] = Field(default=None, ge=0.0, le=1.0)  # Minimum similarity threshold, between 0 and 1
    filter_by_url: Optional[str] = None  # Optional URL to filter by
    filter_by_section: Optional[str] = None  # Optional section heading to filter by
    distance_metric: str = Field(default="cosine", pattern=r"^(cosine|euclidean|dot)$")  # Distance metric to use for search


class ValidationResult(BaseModel):
    """Represents the outcome of validating retrieved chunks."""
    success: bool  # Overall validation success
    total_results: int  # Total number of results retrieved
    valid_results: int  # Number of results that passed validation
    invalid_results: int  # Number of results that failed validation
    issues: List[str]  # List of validation issues found
    metadata_integrity: bool  # Whether all metadata fields are present and valid
    semantic_relevance: bool  # Whether results are semantically relevant
    execution_time: float  # Time taken for the validation process


class QueryResult(BaseModel):
    """Wrapper for the results of a retrieval operation."""
    query: SearchQuery  # The original query
    retrieved_chunks: List[RetrievedChunk]  # List of retrieved chunks
    validation_result: ValidationResult  # Validation of the results
    execution_log: List[str]  # Log of the execution steps


def validate_environment() -> RetrievalConfig:
    """
    Validates that all required environment variables are present.

    Returns:
        RetrievalConfig: Validated configuration object

    Raises:
        ValueError: If required variables are missing
    """
    qdrant_url = os.getenv("QDRANT_URL")
    if not qdrant_url:
        raise ValueError("QDRANT_URL environment variable is required")

    qdrant_api_key = os.getenv("QDRANT_API_KEY")  # Optional for local instances
    qdrant_collection_name = os.getenv("QDRANT_COLLECTION_NAME")
    if not qdrant_collection_name:
        raise ValueError("QDRANT_COLLECTION_NAME environment variable is required")

    cohere_api_key = os.getenv("COHERE_API_KEY")
    if not cohere_api_key:
        raise ValueError("COHERE_API_KEY environment variable is required")

    # Create and return the RetrievalConfig object
    config = RetrievalConfig(
        qdrant_url=qdrant_url,
        qdrant_api_key=qdrant_api_key,
        qdrant_collection_name=qdrant_collection_name,
        cohere_api_key=cohere_api_key
    )

    logger.info("Environment variables validated successfully")
    return config


def initialize_qdrant_client(config: RetrievalConfig) -> QdrantClient:
    """
    Creates and returns a Qdrant client instance.

    Args:
        config: Retrieval configuration

    Returns:
        QdrantClient: Initialized Qdrant client
    """
    # Determine if we need to use HTTPS based on the URL
    if config.qdrant_url.startswith('https://'):
        # For cloud instances with full URL
        client = QdrantClient(
            url=config.qdrant_url,
            api_key=config.qdrant_api_key,
        )
    else:
        # For local instances or partial URLs
        client = QdrantClient(
            host=config.qdrant_url,
            api_key=config.qdrant_api_key,
        )

    logger.info(f"Qdrant client initialized for collection: {config.qdrant_collection_name}")
    return client


def initialize_cohere_client(config: RetrievalConfig) -> cohere.Client:
    """
    Creates and returns a Cohere client instance.

    Args:
        config: Retrieval configuration

    Returns:
        cohere.Client: Initialized Cohere client
    """
    client = cohere.Client(api_key=config.cohere_api_key)
    logger.info("Cohere client initialized")
    return client


async def generate_query_embedding(text: str, config: RetrievalConfig) -> List[float]:
    """
    Generates embedding for query text using Cohere API.

    Args:
        text: Text to generate embedding for
        config: Configuration with Cohere API key

    Returns:
        List[float]: Embedding vector
    """
    try:
        cohere_client = initialize_cohere_client(config)
        response = cohere_client.embed(
            texts=[text],
            model="embed-english-v3.0",  # Using same model as ingestion for compatibility
            input_type="search_query"  # Specify input type for better results
        )
        embedding = response.embeddings[0]
        logger.debug(f"Generated embedding for query: {text[:50]}...")
        return embedding
    except Exception as e:
        logger.error(f"Error generating query embedding: {str(e)}")
        raise


def build_qdrant_filter(filter_by_url: Optional[str], filter_by_section: Optional[str]) -> Optional[models.Filter]:
    """
    Builds Qdrant filter object based on query parameters.

    Args:
        filter_by_url: URL to filter by
        filter_by_section: Section heading to filter by

    Returns:
        Optional[Filter]: Qdrant Filter object or None if no filters specified
    """
    conditions = []

    if filter_by_url:
        conditions.append(models.FieldCondition(
            key="url",
            match=models.MatchValue(value=filter_by_url)
        ))

    if filter_by_section:
        conditions.append(models.FieldCondition(
            key="section_heading",
            match=models.MatchValue(value=filter_by_section)
        ))

    if conditions:
        return models.Filter(must=conditions)
    else:
        return None


async def retrieve_chunks(query: SearchQuery, config: RetrievalConfig) -> List[RetrievedChunk]:
    """
    Executes similarity search against Qdrant and returns retrieved chunks.

    Args:
        query: Contains query text and search parameters
        config: Configuration for the retrieval system

    Returns:
        List[RetrievedChunk]: List of retrieved chunks with metadata
    """
    try:
        # Initialize clients
        qdrant_client = initialize_qdrant_client(config)

        # Validate that collection exists before querying
        try:
            collection_info = qdrant_client.get_collection(config.qdrant_collection_name)
            logger.debug(f"Collection {config.qdrant_collection_name} exists and is accessible")
        except Exception as e:
            logger.error(f"Collection {config.qdrant_collection_name} does not exist or is not accessible: {str(e)}")
            raise

        # Generate embedding for query text
        query_embedding = await generate_query_embedding(query.text, config)

        # Build filter if needed
        qdrant_filter = build_qdrant_filter(query.filter_by_url, query.filter_by_section)

        # Perform similarity search using the query_points method (modern Qdrant API)
        query_response = qdrant_client.query_points(
            collection_name=config.qdrant_collection_name,
            query=query_embedding,  # Pass the embedding vector as the query
            limit=query.top_k,
            score_threshold=query.score_threshold,
            with_payload=True,  # Include payload data with all metadata
            with_vectors=False,  # Don't include vectors unless specifically requested
            query_filter=qdrant_filter
        )

        # Convert search results to RetrievedChunk objects
        retrieved_chunks = []
        # The query_points method returns QueryResponse object with points attribute
        for result in query_response.points:
            # Each result is a ScoredPoint object with id, payload, score, vector attributes
            payload_dict = result.payload

            # Ensure all required fields exist in the payload
            chunk = RetrievedChunk(
                id=str(result.id),
                url=payload_dict.get("url", ""),
                page_title=payload_dict.get("page_title", ""),
                section_heading=payload_dict.get("section_heading", ""),
                chunk_index=payload_dict.get("chunk_index", 0),
                text=payload_dict.get("text", ""),
                similarity_score=result.score,
                vector=result.vector if hasattr(result, 'vector') else None
            )
            retrieved_chunks.append(chunk)

        logger.info(f"Retrieved {len(retrieved_chunks)} chunks for query: {query.text[:50]}...")
        return retrieved_chunks

    except Exception as e:
        logger.error(f"Error retrieving chunks: {str(e)}")
        raise


def validate_retrieved_chunks(chunks: List[RetrievedChunk], query_text: str) -> ValidationResult:
    """
    Validates the integrity and relevance of retrieved chunks.

    Args:
        chunks: List of retrieved chunks to validate
        query_text: Original query text for relevance checking

    Returns:
        ValidationResult: Result of the validation process
    """
    import time
    start_time = time.time()

    issues = []
    valid_results = 0
    invalid_results = 0

    # Check metadata integrity
    metadata_integrity = True
    for chunk in chunks:
        # Validate required fields
        if not chunk.url or not chunk.page_title or not chunk.section_heading or chunk.chunk_index is None or not chunk.text:
            issues.append(f"Chunk {chunk.id} missing required metadata fields")
            metadata_integrity = False
            invalid_results += 1
        else:
            valid_results += 1

    # Check semantic relevance (basic heuristic)
    semantic_relevance = len(chunks) > 0  # If we got results, consider it relevant for now

    execution_time = time.time() - start_time

    validation_result = ValidationResult(
        success=len(issues) == 0,
        total_results=len(chunks),
        valid_results=valid_results,
        invalid_results=invalid_results,
        issues=issues,
        metadata_integrity=metadata_integrity,
        semantic_relevance=semantic_relevance,
        execution_time=execution_time
    )

    logger.info(f"Validation completed: {validation_result.valid_results} valid, {validation_result.invalid_results} invalid out of {validation_result.total_results} total")
    return validation_result


def log_query_execution(query: SearchQuery, result: QueryResult):
    """
    Logs details of query execution for observability.

    Args:
        query: The original search query
        result: The result of the query execution
    """
    # Get total count of vectors in collection
    config = validate_environment()
    qdrant_client = initialize_qdrant_client(config)

    try:
        collection_info = qdrant_client.get_collection(config.qdrant_collection_name)
        total_vectors = collection_info.points_count
    except Exception:
        total_vectors = "unknown"

    logger.info(f"Query: {query.text}")
    logger.info(f"Vectors searched: {total_vectors}")
    logger.info(f"Results returned: {len(result.retrieved_chunks)}")
    logger.info(f"Execution time: {result.validation_result.execution_time:.2f}s")

    # Log top results with URL, section heading, chunk index, and text preview
    for i, chunk in enumerate(result.retrieved_chunks[:3]):  # Log first 3 results
        logger.info(f"Top {i+1} result:")
        logger.info(f"  URL: {chunk.url}")
        logger.info(f"  Section: {chunk.section_heading}")
        logger.info(f"  Chunk Index: {chunk.chunk_index}")
        logger.info(f"  Preview: {chunk.text[:100]}...")
        logger.info(f"  Similarity Score: {chunk.similarity_score}")


def main(query_text: Optional[str] = None, top_k: Optional[int] = None, score_threshold: Optional[float] = None) -> int:
    """
    The primary entry point for the retrieval and validation system.

    Args:
        query_text: Text to search for in the vector database
        top_k: Number of results to return
        score_threshold: Minimum similarity threshold

    Returns:
        int: Exit code (0 for success, non-zero for failure)
    """
    try:
        # Validate environment variables before execution
        config = validate_environment()

        # Use provided parameters or defaults
        if not query_text:
            query_text = "What is physical AI and humanoid robotics?"
        if top_k is None:
            top_k = config.default_top_k
        if score_threshold is None:
            score_threshold = config.default_score_threshold

        # Create a search query with provided parameters
        search_query = SearchQuery(
            text=query_text,
            top_k=top_k,
            score_threshold=score_threshold
        )

        # Execute retrieval
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        retrieved_chunks = loop.run_until_complete(
            retrieve_chunks(search_query, config)
        )
        loop.close()

        # Validate retrieved chunks
        validation_result = validate_retrieved_chunks(retrieved_chunks, query_text)

        # Create execution log
        execution_log = [
            f"Retrieved {len(retrieved_chunks)} chunks",
            f"Validation passed: {validation_result.success}",
            f"Execution time: {validation_result.execution_time}s"
        ]

        # Create final result
        query_result = QueryResult(
            query=search_query,
            retrieved_chunks=retrieved_chunks,
            validation_result=validation_result,
            execution_log=execution_log
        )

        # Log execution details
        log_query_execution(search_query, query_result)

        # Print top results with URL, section heading, chunk index, and text preview
        print("\nTop Results:")
        print("=" * 50)
        for i, chunk in enumerate(query_result.retrieved_chunks[:5]):  # Print first 5 results
            print(f"\n{i+1}. URL: {chunk.url}")
            print(f"   Section: {chunk.section_heading}")
            print(f"   Chunk Index: {chunk.chunk_index}")
            print(f"   Similarity Score: {chunk.similarity_score}")
            print(f"   Preview: {chunk.text[:200]}...")

        return 0

    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        return 1


if __name__ == "__main__":
    import sys
    import argparse

    # Set up argument parser
    parser = argparse.ArgumentParser(description="Retrieve and validate content from Qdrant vector database")
    parser.add_argument("query", nargs="*", help="Query text to search for in the vector database")
    parser.add_argument("--top-k", type=int, default=None, help="Number of results to return (default: 5)")
    parser.add_argument("--score-threshold", type=float, default=None, help="Minimum similarity threshold (default: None)")

    args = parser.parse_args()

    # Use provided query or join all non-flag arguments as query
    query_text = " ".join(args.query) if args.query else None

    # Run main function with provided parameters
    exit_code = main(query_text, args.top_k, args.score_threshold)
    sys.exit(exit_code)