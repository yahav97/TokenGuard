import chromadb
import hashlib
from sentence_transformers import SentenceTransformer

class SemanticCache:
    def __init__(self, threshold: float = 0.85):
        # אתחול מסד נתונים וקטורי פרסיסטנטי
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        
        # יצירת הקולקשן עם הגדרה מפורשת לשימוש ב-Cosine Similarity (סטנדרט בתעשייה ל-NLP)
        self.collection = self.chroma_client.get_or_create_collection(
            name="prompt_cache",
            metadata={"hnsw:space": "cosine"} 
        )
        
        # טעינת מודל ה-Embeddings (רץ מקומית)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.threshold = threshold

    def _generate_id(self, text: str) -> str:
        """מייצר טביעת אצבע ייחודית (Hash) לטקסט כדי למנוע כפילויות"""
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    def lookup(self, prompt: str):
        """
        מחפש בקאש הוקטורי שאלה דומה.
        """
        if self.collection.count() == 0:
            return None
            
        prompt_embedding = self.embedding_model.encode(prompt).tolist()
        
        results = self.collection.query(
            query_embeddings=[prompt_embedding],
            n_results=1,
            include=["documents", "metadatas", "distances"]
        )
        
        if results and results['documents'] and results['documents'][0]:
            # בזכות ה-cosine space שהגדרנו, המרחק הוא בדיוק 1 פחות הדמיון
            distance = results['distances'][0][0]
            similarity = 1.0 - distance
            
            print(f"[Semantic Cache] Closest match similarity: {similarity:.4f}")
            
            if similarity >= self.threshold:
                return results['metadatas'][0][0]['response']
                
        return None

    def insert(self, prompt: str, response: str):
        """שומר פרומפט ותשובה במסד הוקטורי"""
        prompt_embedding = self.embedding_model.encode(prompt).tolist()
        doc_id = self._generate_id(prompt)
        
        try:
            self.collection.upsert(
                ids=[doc_id],
                embeddings=[prompt_embedding],
                documents=[prompt],
                metadatas=[{"response": response}]
            )
            print(f"[Semantic Cache] Cached prompt securely with Hash ID: {doc_id}")
        except Exception as e:
            print(f"[Semantic Cache] Error caching prompt: {str(e)}")