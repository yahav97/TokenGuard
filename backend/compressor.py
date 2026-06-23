from llmlingua import PromptCompressor

# אתחול המודל עם הגדרה מפורשת לרוץ על ה-CPU
compressor = PromptCompressor(
    "microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    device_map="cpu"
)

def compress_prompt(prompt: str) -> str:
    try:
        # --- כאן כנראה יושב הקוד המקורי שלך (HuggingFace / LLMLingua) ---
        # נסה להריץ אותו, ואם הוא עובד - מצוין.
        # (תוכל להשאיר פה את הלוגיקה שהייתה לך קודם)
        
        # דחיסת Fallback קלה כדי למנוע קריסות (הסרת מילות קישור רווחים)
        stop_words = ["please", "can you", "could you", "tell me"]
        compressed = prompt.lower()
        for word in stop_words:
            compressed = compressed.replace(word, "")
            
        return " ".join(compressed.split())
        
    except Exception as e:
        print(f"⚠️ Compression Warning: Failed to compress prompt ({str(e)}). Using original prompt.")
        # חובה! אם הדחיסה נכשלת, מחזירים את הפרומפט המקורי כדי שהשרת לא יקרוס
        return prompt
    
    return results['compressed_prompt']