from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal
from app.models import Base, Quiz, QuizQuestion

from app.core.config import settings
from app.routers import auth, livestock, treatments, sensors, consults, ai, dashboard, heatmap, public_dashboard, alerts, quizzes

Base.metadata.create_all(bind=engine)


def seed_initial_quizzes() -> None:
    db = SessionLocal()
    try:
        if db.query(Quiz).count() > 0:
            return

        quizzes_to_create = [
            {
                'title': 'Biosecurity Basics for Smallholder Farmers',
                'description': 'Learn the core biosecurity practices that protect your herd and prevent disease spread.',
                'topic': 'biosecurity',
                'difficulty': 'beginner',
                'time_limit': 10,
                'passing_score': 70.0,
                'is_active': True,
                'created_by': 'system',
                'questions': [
                    {
                        'question': 'What is the most important first step to prevent the spread of disease when new animals arrive on the farm?',
                        'options': [
                            'Isolate new animals for a quarantine period',
                            'Feed them with extra supplements immediately',
                            'Allow new animals to mingle with the herd right away',
                            'Change their feed daily'
                        ],
                        'correct_answer': 0,
                        'explanation': 'Quarantine new animals before they join the herd to reduce the risk of introducing infections.',
                        'order': 0,
                    },
                    {
                        'question': 'How often should shared tools and equipment be cleaned and disinfected?',
                        'options': [
                            'Once a year',
                            'After every use',
                            'Only when animals appear sick',
                            'Every month'
                        ],
                        'correct_answer': 1,
                        'explanation': 'Cleaning and disinfecting tools after each use helps stop germs from moving between animals and barns.',
                        'order': 1,
                    },
                    {
                        'question': 'Which practice helps reduce respiratory disease transmission in poultry housing?',
                        'options': [
                            'Keeping birds overcrowded',
                            'Separating sick birds from the flock',
                            'Shutting down ventilation',
                            'Using only one feed trough'
                        ],
                        'correct_answer': 1,
                        'explanation': 'Separating sick birds limits exposure and reduces the spread of respiratory infections.',
                        'order': 2,
                    },
                ],
            },
            {
                'title': 'Breeding and Reproduction Practices',
                'description': 'Understand key breeding signals and timing to improve herd reproductive success.',
                'topic': 'breeding',
                'difficulty': 'intermediate',
                'time_limit': 10,
                'passing_score': 70.0,
                'is_active': True,
                'created_by': 'system',
                'questions': [
                    {
                        'question': 'What is the ideal breeding interval for a dairy cow after she has calved?',
                        'options': [
                            '30 days',
                            '60-90 days',
                            '150 days',
                            'One year'
                        ],
                        'correct_answer': 1,
                        'explanation': 'Breeding cows 60-90 days after calving allows time for recovery while maintaining productivity.',
                        'order': 0,
                    },
                    {
                        'question': 'Why is heat detection important in livestock breeding?',
                        'options': [
                            'To know when animals are hungry',
                            'To improve pasture use',
                            'To identify the best time for insemination',
                            'To reduce water consumption'
                        ],
                        'correct_answer': 2,
                        'explanation': 'Detecting heat ensures breeding occurs when the female is most fertile for better conception rates.',
                        'order': 1,
                    },
                    {
                        'question': 'Which sign usually means a sow is ready to mate?',
                        'options': [
                            'Restlessness and swollen vulva',
                            'Decreased appetite',
                            'Rough coat',
                            'Low milk production'
                        ],
                        'correct_answer': 0,
                        'explanation': 'Restlessness and swelling around the vulva are common signs of estrus in sows.',
                        'order': 2,
                    },
                ],
            },
            {
                'title': 'Nutrition and Herd Health',
                'description': 'Review the essentials of feeding, minerals, and water management for healthy livestock.',
                'topic': 'nutrition',
                'difficulty': 'beginner',
                'time_limit': 10,
                'passing_score': 70.0,
                'is_active': True,
                'created_by': 'system',
                'questions': [
                    {
                        'question': 'Which nutrient is most important for building muscle and producing milk?',
                        'options': [
                            'Carbohydrates',
                            'Proteins',
                            'Fats',
                            'Vitamins'
                        ],
                        'correct_answer': 1,
                        'explanation': 'Proteins are essential for growth, muscle repair, and milk production in livestock.',
                        'order': 0,
                    },
                    {
                        'question': 'What is a common sign of mineral deficiency in cattle?',
                        'options': [
                            'Bright, alert eyes',
                            'Poor coat and weak bones',
                            'Rapid weight gain',
                            'Increased fertility'
                        ],
                        'correct_answer': 1,
                        'explanation': 'Poor coat quality and weak bones often point to mineral deficiencies such as calcium or phosphorus.',
                        'order': 1,
                    },
                    {
                        'question': 'During hot weather, livestock need:',
                        'options': [
                            'Less water',
                            'The same ration only',
                            'More water and plenty of shade',
                            'More concentrate feed only'
                        ],
                        'correct_answer': 2,
                        'explanation': 'Hot weather increases the need for water and shade to keep animals healthy and reduce heat stress.',
                        'order': 2,
                    },
                ],
            },
        ]

        for quiz_data in quizzes_to_create:
            quiz = Quiz(
                title=quiz_data['title'],
                description=quiz_data['description'],
                topic=quiz_data['topic'],
                difficulty=quiz_data['difficulty'],
                time_limit=quiz_data['time_limit'],
                passing_score=quiz_data['passing_score'],
                is_active=quiz_data['is_active'],
                created_by=quiz_data['created_by'],
            )
            db.add(quiz)
            db.flush()

            for question_data in quiz_data['questions']:
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question=question_data['question'],
                    options=json.dumps(question_data['options']),
                    correct_answer=question_data['correct_answer'],
                    explanation=question_data['explanation'],
                    order=question_data['order'],
                )
                db.add(question)

        db.commit()
    finally:
        db.close()


seed_initial_quizzes()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(livestock.router, prefix=API_PREFIX)
app.include_router(treatments.router, prefix=API_PREFIX)
app.include_router(sensors.router, prefix=API_PREFIX)
app.include_router(consults.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(heatmap.router, prefix=API_PREFIX)
app.include_router(public_dashboard.router, prefix=API_PREFIX)
app.include_router(alerts.router, prefix=API_PREFIX)
app.include_router(quizzes.router, prefix=API_PREFIX)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
