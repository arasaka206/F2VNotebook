from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    topic: str
    difficulty: str = "intermediate"
    time_limit: Optional[int] = None
    passing_score: float = 70.0
    is_active: bool = True


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    time_limit: Optional[int] = None
    passing_score: Optional[float] = None
    is_active: Optional[bool] = None


class QuizOut(QuizBase):
    id: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class QuizQuestionBase(BaseModel):
    quiz_id: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None
    order: int = 0


class QuizQuestionCreate(QuizQuestionBase):
    pass


class QuizQuestionOut(QuizQuestionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuizWithQuestions(QuizOut):
    questions: List[QuizQuestionOut]


class UserQuizAttemptBase(BaseModel):
    user_id: str
    quiz_id: str
    score: float
    correct_answers: int
    total_questions: int
    time_taken: Optional[int] = None
    status: str = "completed"
    answers: Optional[str] = None  # JSON string


class UserQuizAttemptCreate(UserQuizAttemptBase):
    pass


class UserQuizAttemptOut(UserQuizAttemptBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserAwarenessScoreOut(BaseModel):
    id: str
    user_id: str
    overall_score: float
    quizzes_completed: int
    quizzes_passed: int
    status: str
    last_updated: datetime

    class Config:
        from_attributes = True


class QuizAttemptRequest(BaseModel):
    quiz_id: str
    answers: List[int]  # List of selected option indices
    time_taken: Optional[int] = None