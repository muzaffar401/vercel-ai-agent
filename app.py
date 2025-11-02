import os
from pinecone import Pinecone

# .env load karne ke liye (agar use kar rahe ho)
from dotenv import load_dotenv
load_dotenv()

# Pinecone client initialize karo
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Index connect karo
index_name = os.getenv("PINECONE_INDEX")
index = pc.Index(index_name)

# Test: describe index
print("✅ Connected to:", index_name)
print(index.describe_index_stats())
