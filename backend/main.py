from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cloud App API",
    description="API untuk mata kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Cloud App API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-XX",
        "members": [
            # TODO: Isi dengan data tim Anda
            {"name": "Adam Ibnu Ramadhan", "nim": "10231003", "role": "Lead Backend"},
            {"name": "Alfian Fadillah Putra", "nim": "10231009", "role": "Lead Frontend"},
            {"name": "Varrel Kaleb Ropard Pasaribu", "nim": "10231089", "role": "Lead Container"},
            {"name": "Adhyasta Firdaus", "nim": "10231005", "role": "Lead CI/CD & Deploy"},
            {"name": "Adonia Azarya Tamalonggehe", "nim": "10231007", "role": "Lead QA & Docs"},
        ]
    }
