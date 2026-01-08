#!/usr/bin/env python3
"""
Script to check the current state of the Qdrant collection.
"""

import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

# Get Qdrant settings
qdrant_url = os.getenv('QDRANT_URL')
qdrant_api_key = os.getenv('QDRANT_API_KEY')
collection_name = os.getenv('QDRANT_COLLECTION_NAME', 'book_content_chunks')

print(f"Checking Qdrant collection: {collection_name}")
print(f"Qdrant URL: {qdrant_url}")

try:
    # Initialize Qdrant client
    client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key,
    )

    # Get collection info
    collection_info = client.get_collection(collection_name)
    print(f"Collection vectors count: {collection_info.points_count}")
    print(f"Collection status: {collection_info.status}")

    # Get a few sample points to verify data
    if collection_info.points_count > 0:
        print("\nSample records:")
        records, _ = client.scroll(
            collection_name=collection_name,
            limit=3,
            with_payload=True,
            with_vectors=False
        )

        for i, record in enumerate(records):
            payload = record.payload
            print(f"\nRecord {i+1}:")
            print(f"  ID: {record.id}")
            print(f"  URL: {payload.get('url', 'N/A')[:100]}...")
            print(f"  Title: {payload.get('page_title', 'N/A')[:50]}...")
            print(f"  Section: {payload.get('section_heading', 'N/A')[:50]}...")
            print(f"  Chunk Index: {payload.get('chunk_index', 'N/A')}")
            print(f"  Text preview: {payload.get('text', 'N/A')[:100]}...")

    print("\n✅ Qdrant collection check completed successfully!")

except Exception as e:
    print(f"❌ Error checking Qdrant collection: {e}")
    import traceback
    traceback.print_exc()