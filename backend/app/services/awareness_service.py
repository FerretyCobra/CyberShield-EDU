import json
import os
from app.utils.logger import logger
from app.config import settings

class AwarenessService:
    def __init__(self):
        self.resources_path = os.path.join(settings.BASE_DIR, "..", "data", "educational_resources.json")
        self.content = self._load_resources()

    def _load_resources(self):
        try:
            if os.path.exists(self.resources_path):
                with open(self.resources_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                logger.warning(f"Resources file not found at {self.resources_path}")
                return {}
        except Exception as e:
            logger.error(f"Failed to load educational resources: {str(e)}")
            return {}

    def get_all_content(self):
        return self.content

    def get_category(self, category_name: str):
        return self.content.get(category_name, {})

awareness_service = AwarenessService()
