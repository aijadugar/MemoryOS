from pydantic import BaseModel, Field


class LLMMessage(BaseModel):
    role: str = Field(pattern="^(system|user|assistant)$")
    content: str = Field(min_length=1)


class LLMChatRequest(BaseModel):
    messages: list[LLMMessage] = Field(min_length=1)
    system_prompt: str | None = None


class LLMChatResponse(BaseModel):
    content: str
    model: str


class LLMSummarizeRequest(BaseModel):
    text: str = Field(min_length=1)


class LLMSummarizeResponse(BaseModel):
    summary: str
    model: str


class LLMTitleRequest(BaseModel):
    text: str = Field(min_length=1)


class LLMTitleResponse(BaseModel):
    title: str
    model: str


class LLMKeywordsRequest(BaseModel):
    text: str = Field(min_length=1)


class LLMKeywordsResponse(BaseModel):
    keywords: list[str]
    model: str


class LLMClassifyRequest(BaseModel):
    text: str = Field(min_length=1)
    categories: list[str] = Field(min_length=1)


class LLMClassifyResponse(BaseModel):
    category: str
    model: str


class LLMEmbeddingRequest(BaseModel):
    text: str = Field(min_length=1)


class LLMEmbeddingResponse(BaseModel):
    embedding: list[float]
    model: str
