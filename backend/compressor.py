from llmlingua import PromptCompressor

# אתחול המודל קורה פעם אחת (בפעם הראשונה זה יוריד מודל קטן למחשב)

compressor = PromptCompressor("microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank")

def compress_prompt(prompt: str) -> str:
    if not prompt:
        return ""
        
    # כיווץ הפרומפט תוך שמירה על המשמעות הסמנטית
    results = compressor.compress_prompt(
        prompt,
        rate=0.7, 
        force_tokens=['\n', '?', '!'] # סימנים שאסור למחוק
    )
    
    return results['compressed_prompt']