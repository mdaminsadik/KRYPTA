import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.intelligence import router as intelligence_router
from app.api.digital_twin import router as digital_twin_router

app = FastAPI(
    title="KRYPTA API",
    description="Financial Crime Intelligence Platform with Counterfactual Digital Twin Simulation",
    version="1.1.0"
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intelligence_router)
app.include_router(digital_twin_router)

@app.get("/")
def home():
    return {
        "name": "KRYPTA",
        "message": "Financial Crime Intelligence Platform",
        "status": "operational",
        "innovation": "Financial Crime Digital Twin"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "KRYPTA Backend",
        "version": "1.1.0"
    }
