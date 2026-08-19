from .quiz import router as quiz_router
from .products import router as products_router
from .recommendations import router as recommendations_router
from .agent import router as agent_router

__all__ = ["quiz_router", "products_router", "recommendations_router", "agent_router"]
