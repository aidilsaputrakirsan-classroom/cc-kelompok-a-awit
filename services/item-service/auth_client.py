"""
HTTP client untuk berkomunikasi dengan Auth Service.
Item Service TIDAK memiliki akses ke auth_db — ia memanggil
Auth Service via HTTP untuk memverifikasi token.
"""
import os
import httpx
from typing import Optional
from fastapi import HTTPException, Header

from circuit_breaker import CircuitBreaker

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")

# Global circuit breaker instance
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,
    cooldown_seconds=30,
)

async def verify_token_with_auth_service(request: Request, authorization: str = Header(...)) -> dict:
    """
    Dependency: Verifikasi token dengan memanggil Auth Service.
    Digunakan sebagai Depends() di endpoints yang butuh autentikasi.
    """
    if not auth_circuit.can_execute():
        raise HTTPException(
            status_code=503,
            detail="Auth Service circuit breaker OPEN. Try again later."
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers=headers,
                timeout=5.0,
            )

        if response.status_code == 200:
            auth_circuit.record_success()
            return response.json()  # {user_id, email, name}
        elif response.status_code == 401:
            auth_circuit.record_success()  # Service is up, just invalid token
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        else:
            auth_circuit.record_failure()
            raise HTTPException(status_code=503, detail="Auth service unavailable")

    except httpx.ConnectError:
        auth_circuit.record_failure()
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Auth Service. Is it running?"
        )
    except httpx.TimeoutException:
        auth_circuit.record_failure()
        raise HTTPException(
            status_code=504,
            detail="Auth Service timeout"
        )


async def verify_token_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Dependency: Optional verifikasi token.
    Akan mengembalikan None jika token tidak ada atau Auth Service sedang down.
    Digunakan untuk graceful degradation.
    """
    if not authorization:
        return None

    try:
        return await verify_token_with_auth_service(authorization)
    except HTTPException as e:
        if e.status_code in [503, 504]:
            return None  # Degradation: return None user if auth is down
        raise e  # Still raise 401 for invalid token if auth is up