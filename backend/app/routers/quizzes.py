from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import Quiz, QuizQuestion, UserQuizAttempt, UserAwarenessScore, NotebookLog
from app.schemas.quiz import (
    QuizCreate, QuizUpdate, QuizOut, QuizWithQuestions,
    QuizQuestionCreate, QuizQuestionOut,
    UserQuizAttemptCreate, UserQuizAttemptOut,
    UserAwarenessScoreOut, QuizAttemptRequest
)
import json
import uuid
import google.generativeai as genai
from app.core.config import settings

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    quiz_model = genai.GenerativeModel("gemini-2.5-flash")
else:
    quiz_model = None


def _clean_ai_json(text: str) -> str:
    text = text.strip()
    for marker in ['```json', '```', 'json']:
        text = text.replace(marker, '')
    return text.strip()


def _build_fallback_quiz_payload(note: NotebookLog) -> dict:
    summary = (note.summary or note.content.split('.')[:1][0]).strip()
    tags = json.loads(note.tags) if note.tags else []
    recommendations = json.loads(note.recommendations) if note.recommendations else []
    difficulty = 'advanced' if note.urgency in ['High', 'Critical'] else 'intermediate'

    first_recommendation = recommendations[0] if recommendations else 'Review herd condition and follow veterinary advice.'
    first_tag = tags[0] if tags else 'health'

    return {
        'title': f'Notebook Quiz on {first_tag.capitalize()}',
        'description': f'Questions derived from the farmer notebook entry: "{summary}".',
        'topic': 'notebook',
        'difficulty': difficulty,
        'time_limit': 10,
        'passing_score': 80.0,
        'questions': [
            {
                'question': 'What was the main issue described in the notebook entry?',
                'options': [summary, 'No issue was described', 'A feed delivery delay', 'A water supply problem'],
                'correct_answer': 0,
                'explanation': 'The notebook entry described the primary issue in the summary.'
            },
            {
                'question': 'Which action was recommended for this situation?',
                'options': [first_recommendation, 'Ignore the symptoms', 'Change the herd immediately', 'Reduce water intake'],
                'correct_answer': 0,
                'explanation': 'The recommended action is based on the notebook note analysis.'
            },
            {
                'question': 'What topic does this notebook entry relate to?',
                'options': [first_tag.capitalize(), 'Finance', 'Transportation', 'Weather'],
                'correct_answer': 0,
                'explanation': 'The notebook note is classified under the primary tag from the note data.'
            }
        ]
    }


def _build_quiz_payload_from_note(note: NotebookLog) -> dict:
    note_content = note.content.strip()
    note_summary = note.summary or note_content.split('.')[:1][0].strip()
    note_tags = json.loads(note.tags) if note.tags else []
    note_recommendations = json.loads(note.recommendations) if note.recommendations else []
    difficulty = 'advanced' if note.urgency in ['High', 'Critical'] else 'intermediate'

    if not quiz_model:
        return _build_fallback_quiz_payload(note)

    prompt = f"""
You are an expert AI quiz author for a livestock farmer learning system. Read the field notebook note below and create a short quiz that tests the farmer's understanding of the problem described.

Notebook note:
{note_content}

Note summary:
{note_summary}

Tags: {note_tags}
Recommendations: {note_recommendations}

Create exactly 3 multiple-choice questions. Each question should have 4 answer options, one correct answer indexed from 0, and a short explanation.

Return valid JSON only with this structure:
{{
  "title": "...",
  "description": "...",
  "topic": "notebook",
  "difficulty": "beginner|intermediate|advanced",
  "time_limit": 10,
  "passing_score": 80.0,
  "questions": [
    {{
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": 0,
      "explanation": "..."
    }},
    ...
  ]
}}
Do not include markdown fences or any extra text.
"""

    try:
        response = quiz_model.generate_content(prompt)
        payload_text = _clean_ai_json(response.text)
        return json.loads(payload_text)
    except Exception:
        return _build_fallback_quiz_payload(note)


@router.post("/from-notebook/{note_id}", response_model=QuizWithQuestions)
def generate_quiz_from_notebook(
    note_id: str,
    db: Session = Depends(get_db)
):
    note = db.query(NotebookLog).filter(NotebookLog.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notebook entry not found")

    payload = _build_quiz_payload_from_note(note)

    quiz = Quiz(
        title=payload['title'],
        description=payload.get('description'),
        topic=payload.get('topic', 'notebook'),
        difficulty=payload.get('difficulty', 'intermediate'),
        time_limit=payload.get('time_limit', 10),
        passing_score=payload.get('passing_score', 80.0),
        is_active=True,
        created_by=f'notebook:{note_id}',
    )
    db.add(quiz)
    db.flush()

    questions_out = []
    for index, question_data in enumerate(payload.get('questions', [])):
        if len(question_data.get('options', [])) != 4:
            continue
        question = QuizQuestion(
            quiz_id=quiz.id,
            question=question_data['question'],
            options=json.dumps(question_data['options'], ensure_ascii=False),
            correct_answer=question_data['correct_answer'],
            explanation=question_data.get('explanation'),
            order=index,
        )
        db.add(question)
        db.flush()
        questions_out.append(QuizQuestionOut(
            id=question.id,
            quiz_id=question.quiz_id,
            question=question.question,
            options=question_data['options'],
            correct_answer=question.correct_answer,
            explanation=question.explanation,
            order=question.order,
            created_at=question.created_at
        ))

    db.commit()
    db.refresh(quiz)

    return QuizWithQuestions(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        passing_score=quiz.passing_score,
        is_active=quiz.is_active,
        created_by=quiz.created_by,
        created_at=quiz.created_at,
        updated_at=quiz.updated_at,
        questions=questions_out
    )


# ═════════════════════════════════════════════════════════════════════════════
# QUIZZES
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/", response_model=list[QuizOut])
def get_quizzes(
    topic: str = Query(None),
    difficulty: str = Query(None),
    is_active: bool = Query(True),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get list of quizzes with optional filtering."""
    query = db.query(Quiz).filter(Quiz.is_active == is_active)

    if topic:
        query = query.filter(Quiz.topic == topic)
    if difficulty:
        query = query.filter(Quiz.difficulty == difficulty)

    quizzes = query.order_by(desc(Quiz.created_at)).limit(limit).all()
    return quizzes


@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz_with_questions(
    quiz_id: str,
    db: Session = Depends(get_db)
):
    """Get a quiz with all its questions."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).order_by(QuizQuestion.order).all()

    questions_out = []
    for q in questions:
        options = json.loads(q.options) if q.options else []
        questions_out.append(QuizQuestionOut(
            id=q.id,
            quiz_id=q.quiz_id,
            question=q.question,
            options=options,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            order=q.order,
            created_at=q.created_at
        ))

    return QuizWithQuestions(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        topic=quiz.topic,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        passing_score=quiz.passing_score,
        is_active=quiz.is_active,
        created_by=quiz.created_by,
        created_at=quiz.created_at,
        updated_at=quiz.updated_at,
        questions=questions_out
    )


@router.post("/", response_model=QuizOut)
def create_quiz(
    quiz_data: QuizCreate,
    created_by: str = Query(None),
    db: Session = Depends(get_db)
):
    """Create a new quiz (admin only)."""
    quiz = Quiz(**quiz_data.model_dump(), created_by=created_by)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.post("/{quiz_id}/questions", response_model=QuizQuestionOut)
def add_question_to_quiz(
    quiz_id: str,
    question_data: QuizQuestionCreate,
    db: Session = Depends(get_db)
):
    """Add a question to a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    question = QuizQuestion(
        quiz_id=quiz_id,
        question=question_data.question,
        options=json.dumps(question_data.options),
        correct_answer=question_data.correct_answer,
        explanation=question_data.explanation,
        order=question_data.order
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    return QuizQuestionOut(
        id=question.id,
        quiz_id=question.quiz_id,
        question=question.question,
        options=question_data.options,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        order=question.order,
        created_at=question.created_at
    )


# ═════════════════════════════════════════════════════════════════════════════
# QUIZ ATTEMPTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/attempt", response_model=UserQuizAttemptOut)
def submit_quiz_attempt(
    attempt_data: QuizAttemptRequest,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Submit a quiz attempt and calculate score."""
    quiz = db.query(Quiz).filter(Quiz.id == attempt_data.quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == attempt_data.quiz_id).all()
    if len(attempt_data.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Number of answers doesn't match number of questions")

    # Calculate score
    correct_answers = 0
    for i, question in enumerate(questions):
        if attempt_data.answers[i] == question.correct_answer:
            correct_answers += 1

    score = (correct_answers / len(questions)) * 100
    status = "completed" if score >= quiz.passing_score else "failed"

    # Save attempt
    attempt = UserQuizAttempt(
        user_id=user_id,
        quiz_id=attempt_data.quiz_id,
        score=score,
        correct_answers=correct_answers,
        total_questions=len(questions),
        time_taken=attempt_data.time_taken,
        status=status,
        answers=json.dumps(attempt_data.answers)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Update user awareness score
    update_user_awareness_score(user_id, db)

    return attempt


@router.get("/user/{user_id}/attempts", response_model=list[UserQuizAttemptOut])
def get_user_quiz_attempts(
    user_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get quiz attempts for a user."""
    attempts = db.query(UserQuizAttempt).filter(
        UserQuizAttempt.user_id == user_id
    ).order_by(desc(UserQuizAttempt.created_at)).limit(limit).all()
    return attempts


# ═════════════════════════════════════════════════════════════════════════════
# USER AWARENESS SCORES
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/user/{user_id}/awareness", response_model=UserAwarenessScoreOut)
def get_user_awareness_score(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user's awareness score."""
    score = db.query(UserAwarenessScore).filter(UserAwarenessScore.user_id == user_id).first()
    if not score:
        # Create default score if not exists
        score = UserAwarenessScore(user_id=user_id)
        db.add(score)
        db.commit()
        db.refresh(score)
    return score


def update_user_awareness_score(user_id: str, db: Session):
    """Update user's overall awareness score based on latest quiz attempts per quiz."""
    attempts = db.query(UserQuizAttempt).filter(UserQuizAttempt.user_id == user_id).order_by(UserQuizAttempt.quiz_id, UserQuizAttempt.created_at.desc()).all()

    if not attempts:
        return

    latest_attempts = {}
    for attempt in attempts:
        if attempt.quiz_id not in latest_attempts:
            latest_attempts[attempt.quiz_id] = attempt

    latest_list = list(latest_attempts.values())
    total_score = round(sum(attempt.score for attempt in latest_list) / len(latest_list), 2)
    quizzes_completed = len(latest_list)
    quizzes_passed = len([a for a in latest_list if a.status == "completed"])

    # Determine status
    if total_score >= 80:
        status = "good"
    elif total_score >= 60:
        status = "needs_improvement"
    else:
        status = "restricted"

    # Update or create score record
    score_record = db.query(UserAwarenessScore).filter(UserAwarenessScore.user_id == user_id).first()
    if score_record:
        score_record.overall_score = total_score
        score_record.quizzes_completed = quizzes_completed
        score_record.quizzes_passed = quizzes_passed
        score_record.status = status
    else:
        score_record = UserAwarenessScore(
            user_id=user_id,
            overall_score=total_score,
            quizzes_completed=quizzes_completed,
            quizzes_passed=quizzes_passed,
            status=status
        )
        db.add(score_record)

    db.commit()