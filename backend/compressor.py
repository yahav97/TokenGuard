from llmlingua import PromptCompressor

# אתחול המודל עם הגדרה מפורשת לרוץ על ה-CPU
compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    device_map="cpu"
)

def compress_prompt(prompt: str) -> str:
    if not prompt:
        return ""
        
    # כיווץ הפרומפט תוך שמירה על המשמעות הסמנטית
    results = compressor.compress_prompt(
        prompt,
        rate=0.6, # שומר 60% מהטקסט המקורי
        force_tokens=['\n', '?', '!'] # סימנים שאסור למחוק
    )
    
    return results['compressed_prompt']