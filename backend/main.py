from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes, auth
from app.core.config import settings
from app.db.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="IntelliHire AI Backend API"
)

# Allowed frontend origins
origins = [
    "http://localhost:3000",
    "https://intellihire-ai-eight.vercel.app",
]

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    routes.router,
    prefix=settings.API_V1_STR,
    tags=["Core APIs"]
)

# Root Endpoint
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "status": "running",
        "version": "1.0.0"
    }

# Health Check Endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }