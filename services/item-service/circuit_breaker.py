import time
import logging

logger = logging.getLogger(__name__)

class CircuitBreaker:
    def __init__(self, name: str = "default", failure_threshold: int = 5, cooldown_seconds: int = 30):
        self.name = name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.success_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None
        self.total_rejected = 0

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            elapsed = time.time() - self.last_failure_time
            if elapsed >= self.cooldown_seconds:
                logger.info(f"[CircuitBreaker:{self.name}] Cooldown selesai. State: OPEN → HALF_OPEN")
                self.state = "HALF_OPEN"
                return True
            else:
                self.total_rejected += 1
                return False
        return True

    def record_success(self):
        self.failure_count = 0
        self.success_count += 1
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            logger.error(f"[CircuitBreaker:{self.name}] Threshold tercapai. State: CLOSED → OPEN")
            self.state = "OPEN"

    def get_status(self) -> dict:
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "total_rejected": self.total_rejected,
            "cooldown_seconds": self.cooldown_seconds,
        }