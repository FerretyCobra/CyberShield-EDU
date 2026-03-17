import app.config as c
import app.utils.llm_generator as g
import traceback

try:
    g.initialize_gemini(c.settings.GEMINI_API_KEY)
    res = g.generate_quiz_questions(1)
    if not res:
        print("Function returned empty list.")
except Exception as e:
    with open("error.log", "w") as f:
        f.write(traceback.format_exc())
