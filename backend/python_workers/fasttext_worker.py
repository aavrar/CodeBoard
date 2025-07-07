#!/usr/bin/env python3
"""
FastText Language Detection Worker
Lightweight Python worker for real-time language detection using FastText.
Communicates via stdin/stdout for maximum memory efficiency (~15-20MB total).

Usage: python3 fasttext_worker.py
Input: JSON lines with {"text": "...", "languages": [...]}  
Output: JSON lines with detection results
"""

import sys
import json
import fasttext
import os
import tempfile
import logging
from typing import List, Dict, Any

# Configure logging to stderr to avoid interfering with stdout communication
logging.basicConfig(level=logging.INFO, stream=sys.stderr, 
                   format='[FastText Worker] %(levelname)s: %(message)s')

class FastTextWorker:
    def __init__(self):
        self.model = None
        self.model_path = None
        self.languages_map = self._create_language_mapping()
        
    def _create_language_mapping(self) -> Dict[str, str]:
        """Map common language names to FastText language codes"""
        return {
            'english': 'en',
            'spanish': 'es', 
            'hindi': 'hi',
            'mandarin': 'zh',
            'chinese': 'zh',
            'french': 'fr',
            'arabic': 'ar',
            'portuguese': 'pt',
            'russian': 'ru',
            'japanese': 'ja',
            'german': 'de',
            'korean': 'ko',
            'italian': 'it',
            'dutch': 'nl',
            'swedish': 'sv',
            'norwegian': 'no',
            'tagalog': 'tl',
            'urdu': 'ur',
            'bengali': 'bn',
            'vietnamese': 'vi',
            'turkish': 'tr',
            'polish': 'pl',
            'ukrainian': 'uk',
            'czech': 'cs',
            'greek': 'el',
            'hebrew': 'he',
            'thai': 'th',
            'romanian': 'ro',
            'hungarian': 'hu',
            'finnish': 'fi',
            'bulgarian': 'bg',
            'croatian': 'hr',
            'slovak': 'sk',
            'lithuanian': 'lt',
            'latvian': 'lv',
            'estonian': 'et',
            'slovenian': 'sl',
            'macedonian': 'mk',
            'albanian': 'sq',
            'serbian': 'sr',
            'bosnian': 'bs',
            'montenegrin': 'cnr',
            'maltese': 'mt'
        }
    
    def _download_model(self) -> str:
        """Download FastText language identification model if not present"""
        try:
            # Try to download the compact model (~15MB)
            model_path = tempfile.gettempdir() + '/lid.176.ftz'
            
            if not os.path.exists(model_path):
                logging.info("Downloading FastText language model...")
                import urllib.request
                url = 'https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz'
                urllib.request.urlretrieve(url, model_path)
                logging.info(f"Model downloaded to: {model_path}")
            
            return model_path
        except Exception as e:
            logging.error(f"Failed to download model: {e}")
            # Fallback: try to use any existing model
            fallback_paths = [
                '/tmp/lid.176.ftz',
                './lid.176.ftz',
                '../models/lid.176.ftz'
            ]
            for path in fallback_paths:
                if os.path.exists(path):
                    logging.info(f"Using fallback model: {path}")
                    return path
            raise Exception("No FastText model available")
    
    def initialize(self):
        """Initialize the FastText model"""
        try:
            self.model_path = self._download_model()
            logging.info("Loading FastText model...")
            self.model = fasttext.load_model(self.model_path)
            logging.info("FastText model loaded successfully")
            return True
        except Exception as e:
            logging.error(f"Failed to initialize FastText: {e}")
            return False
    
    def _normalize_language(self, lang: str) -> str:
        """Normalize language name to FastText code"""
        lang_lower = lang.lower().strip()
        return self.languages_map.get(lang_lower, lang_lower[:2])
    
    def detect_language(self, text: str, user_languages: List[str] = None) -> Dict[str, Any]:
        """
        Detect language of text using FastText
        
        Args:
            text: Input text to analyze
            user_languages: User-specified languages for bias
            
        Returns:
            Dict with detection results
        """
        if not self.model:
            return {"error": "FastText model not initialized"}
        
        try:
            # Clean text for FastText
            cleaned_text = text.replace('\n', ' ').replace('\r', ' ').strip()
            if not cleaned_text:
                return {"error": "Empty text provided"}
            
            # Predict languages with confidence scores
            predictions = self.model.predict(cleaned_text, k=5)  # Top 5 predictions
            labels, confidences = predictions
            
            # Process results
            detected_languages = []
            for label, confidence in zip(labels, confidences):
                # FastText labels are like '__label__en'
                lang_code = label.replace('__label__', '')
                detected_languages.append({
                    'language': lang_code,
                    'confidence': float(confidence),
                    'name': self._code_to_name(lang_code)
                })
            
            # Calculate phrase-level analysis for simple tokenization
            words = cleaned_text.split()
            phrases = []
            tokens = []
            
            for i, word in enumerate(words):
                # Simple word-level detection (FastText works better on longer text)
                word_pred = self.model.predict(word, k=1)
                word_lang = word_pred[0][0].replace('__label__', '') if word_pred[0] else 'unknown'
                word_conf = float(word_pred[1][0]) if word_pred[1] else 0.0
                
                tokens.append({
                    'word': word,
                    'lang': word_lang,
                    'language': self._code_to_name(word_lang),
                    'confidence': word_conf
                })
            
            # Group consecutive words of same language into phrases
            if tokens:
                current_phrase = [tokens[0]]
                for token in tokens[1:]:
                    if token['lang'] == current_phrase[-1]['lang']:
                        current_phrase.append(token)
                    else:
                        # End current phrase, start new one
                        phrases.append(self._create_phrase(current_phrase))
                        current_phrase = [token]
                
                # Add final phrase
                if current_phrase:
                    phrases.append(self._create_phrase(current_phrase))
            
            # Determine switch points (boundaries between different languages)
            switch_points = []
            for i in range(len(phrases) - 1):
                if phrases[i]['language'] != phrases[i + 1]['language']:
                    switch_points.append(phrases[i]['endIndex'])
            
            # Calculate overall confidence and user language match
            primary_lang = detected_languages[0] if detected_languages else None
            user_lang_match = False
            if user_languages and primary_lang:
                normalized_user_langs = [self._normalize_language(lang) for lang in user_languages]
                user_lang_match = primary_lang['language'] in normalized_user_langs
            
            return {
                'tokens': tokens,
                'phrases': phrases,
                'switchPoints': switch_points,
                'confidence': primary_lang['confidence'] if primary_lang else 0.0,
                'userLanguageMatch': user_lang_match,
                'detectedLanguages': [lang['name'] for lang in detected_languages[:3]],
                'processing': {
                    'timeMs': 0,  # Will be calculated by caller
                    'engine': 'FastText',
                    'modelPath': self.model_path,
                    'tokensPerSecond': len(tokens) * 1000 if tokens else 0  # Approximate
                }
            }
            
        except Exception as e:
            logging.error(f"Detection error: {e}")
            return {"error": f"Detection failed: {str(e)}"}
    
    def _create_phrase(self, tokens: List[Dict]) -> Dict[str, Any]:
        """Create a phrase object from consecutive tokens"""
        words = [token['word'] for token in tokens]
        text = ' '.join(words)
        avg_confidence = sum(token['confidence'] for token in tokens) / len(tokens)
        
        return {
            'words': words,
            'text': text,
            'language': tokens[0]['language'],
            'confidence': avg_confidence,
            'startIndex': 0,  # Simplified for now
            'endIndex': len(words),
            'isUserLanguage': False  # Will be set by caller if needed
        }
    
    def _code_to_name(self, code: str) -> str:
        """Convert language code to readable name"""
        code_to_name_map = {
            'en': 'English',
            'es': 'Spanish', 
            'hi': 'Hindi',
            'zh': 'Chinese',
            'fr': 'French',
            'ar': 'Arabic',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'de': 'German',
            'ko': 'Korean',
            'it': 'Italian',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'tl': 'Tagalog',
            'ur': 'Urdu',
            'bn': 'Bengali',
            'vi': 'Vietnamese',
            'tr': 'Turkish',
            'pl': 'Polish',
            'uk': 'Ukrainian',
            'cs': 'Czech',
            'el': 'Greek',
            'he': 'Hebrew',
            'th': 'Thai',
            'ro': 'Romanian',
            'hu': 'Hungarian',
            'fi': 'Finnish',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sk': 'Slovak',
            'lt': 'Lithuanian',
            'lv': 'Latvian',
            'et': 'Estonian',
            'sl': 'Slovenian',
            'mk': 'Macedonian',
            'sq': 'Albanian',
            'sr': 'Serbian',
            'bs': 'Bosnian',
            'mt': 'Maltese'
        }
        return code_to_name_map.get(code, code.upper())

def main():
    """Main worker loop"""
    worker = FastTextWorker()
    
    # Initialize model
    if not worker.initialize():
        print(json.dumps({"error": "Failed to initialize FastText model"}))
        sys.exit(1)
    
    # Send ready signal
    print(json.dumps({"status": "ready", "engine": "FastText", "model": worker.model_path}))
    sys.stdout.flush()
    
    # Process requests
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
                
            try:
                request = json.loads(line)
                text = request.get('text', '')
                languages = request.get('languages', [])
                
                if not text:
                    response = {"error": "No text provided"}
                else:
                    import time
                    start_time = time.time()
                    result = worker.detect_language(text, languages)
                    end_time = time.time()
                    
                    if 'processing' in result:
                        result['processing']['timeMs'] = round((end_time - start_time) * 1000, 2)
                    
                    response = result
                
                print(json.dumps(response))
                sys.stdout.flush()
                
            except json.JSONDecodeError as e:
                print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
                sys.stdout.flush()
            except Exception as e:
                logging.error(f"Request processing error: {e}")
                print(json.dumps({"error": f"Processing failed: {str(e)}"}))
                sys.stdout.flush()
                
    except KeyboardInterrupt:
        logging.info("Worker shutting down...")
    except Exception as e:
        logging.error(f"Worker error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()