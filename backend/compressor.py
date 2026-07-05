from llmlingua import PromptCompressor

# Initialize the model with an explicit CPU device map
compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    device_map="cpu"
)

def compress_prompt(prompt: str) -> str:
    try:
        # --- Original HuggingFace / LLMLingua compression logic can go here ---
        
        # Lightweight fallback compression to avoid crashes (strip filler phrases)
        stop_words = ["please", "can you", "could you", "tell me"]
        compressed = prompt.lower()
        for word in stop_words:
            compressed = compressed.replace(word, "")
            
        return " ".join(compressed.split())
        
    except Exception as e:
        print(f"Compression warning: failed to compress prompt ({str(e)}). Using original prompt.")
        # Return the original prompt on failure so the server keeps running
        return prompt
    
    return results['compressed_prompt']