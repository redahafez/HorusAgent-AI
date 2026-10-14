import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "HorusAgent-AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    
    # Execution & Simulation Mode
    MOCK_LLM_MODE: bool = True
    
    # Optional Live Provider Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Vector RAG Configuration
    VECTOR_DIMENSION: int = 128
    SIMILARITY_THRESHOLD: float = 0.60
    MAX_RAG_CITATIONS: int = 4
    
    # Governance & Limits
    ENABLE_PII_SANITATION: bool = True
    MAX_TOKEN_BUDGET: int = 16000
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
