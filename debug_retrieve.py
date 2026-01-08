#!/usr/bin/env python3
"""
Debug script to test Qdrant retrieval with more detailed error handling
"""

import os
import asyncio
import logging
from typing import List

import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def debug_retrieval():
    # Load environment variables
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    qdrant_collection_name = os.getenv("QDRANT_COLLECTION_NAME", "book_content_chunks")
    cohere_api_key = os.getenv("COHERE_API_KEY")

    print(f"Connecting to Qdrant URL: {qdrant_url}")
    print(f"Collection name: {qdrant_collection_name}")

    # Initialize Qdrant client
    client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key,
    )

    # Test collection existence
    try:
        collection_info = client.get_collection(qdrant_collection_name)
        print(f"Collection exists: {collection_info.status}")
        print(f"Points count: {collection_info.points_count}")
    except Exception as e:
        print(f"Error getting collection info: {e}")
        return

    # Generate a simple embedding for testing
    cohere_client = cohere.Client(api_key=cohere_api_key)
    test_text = "What is physical AI and humanoid robotics?"

    try:
        response = cohere_client.embed(
            texts=[test_text],
            model="embed-english-v3.0",
            input_type="search_query"
        )
        query_embedding = response.embeddings[0]
        print(f"Generated embedding with {len(query_embedding)} dimensions")
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return

    # Test the query_points method with timeout
    try:
        print("Executing query_points...")
        query_response = client.query_points(
            collection_name=qdrant_collection_name,
            query=query_embedding,
            limit=5,
            with_payload=True,
            with_vectors=False
        )
        print(f"Query successful! Found {len(query_response.points)} results")

        # Print first few results
        for i, result in enumerate(query_response.points[:3]):
            payload = result.payload
            print(f"\nResult {i+1}:")
            print(f"  ID: {result.id}")
            print(f"  URL: {payload.get('url', 'N/A')[:100]}...")
            print(f"  Score: {result.score}")
            print(f"  Text preview: {payload.get('text', 'N/A')[:100]}...")

    except Exception as e:
        print(f"Error during query_points: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_retrieval())