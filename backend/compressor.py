from llmlingua import PromptCompressor

compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    device_map="cpu"
)

def compress_prompt(prompt: str) -> str:
    try:
    
        stop_words = ["please", "can you", "could you", "tell me"]
        compressed = prompt.lower()
        for word in stop_words:
            compressed = compressed.replace(word, "")
            
        return " ".join(compressed.split())
        
    except Exception as e:
        print(f"Compression warning: failed to compress prompt ({str(e)}). Using original prompt.")
        return prompt
    
    return results['compressed_prompt']