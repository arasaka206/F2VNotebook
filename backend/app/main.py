from __future__ import annotations

import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal
from app.models import Base, Quiz, QuizQuestion, InventoryItem, InventoryTransaction, Sale, Production, AnalyticsReport

from app.core.config import settings
from app.routers import auth, livestock, treatments, sensors, consults, ai, dashboard, heatmap, public_dashboard, alerts, quizzes, inventory, analytics

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


def seed_initial_inventory_and_analytics() -> None:
    """Seed sample inventory, sales, production, and analytics data for demonstration."""
    db = SessionLocal()
    try:
        from datetime import date, timedelta
        
        farmer_id = "farmer_default"
        
        # Check if data already exists
        if db.query(InventoryItem).filter(InventoryItem.farmer_id == farmer_id).count() > 0:
            return
        
        # Create inventory items
        inventory_items_data = [
            InventoryItem(
                farmer_id=farmer_id,
                name="Cattle Feed Premium",
                category="feed",
                quantity=1500,
                unit="kg",
                unit_cost=15000,  # VND
                unit_price=18000,
                min_quantity=500,
                description="High-quality cattle feed with balanced nutrition"
            ),
            InventoryItem(
                farmer_id=farmer_id,
                name="Veterinary Medicine - Antibiotics",
                category="medicine",
                quantity=200,
                unit="vials",
                unit_cost=50000,
                unit_price=75000,
                min_quantity=50,
                description="Broad-spectrum antibiotics for livestock"
            ),
            InventoryItem(
                farmer_id=farmer_id,
                name="Milking Equipment",
                category="equipment",
                quantity=5,
                unit="set",
                unit_cost=5000000,
                unit_price=6000000,
                min_quantity=1,
                description="Automatic milking machine set"
            ),
            InventoryItem(
                farmer_id=farmer_id,
                name="Vaccine - FMD",
                category="medicine",
                quantity=100,
                unit="doses",
                unit_cost=25000,
                unit_price=40000,
                min_quantity=20,
                description="Foot and mouth disease vaccine"
            ),
            InventoryItem(
                farmer_id=farmer_id,
                name="Poultry Feed",
                category="feed",
                quantity=800,
                unit="kg",
                unit_cost=12000,
                unit_price=14000,
                min_quantity=200,
                description="Specialized poultry feed for laying hens"
            ),
        ]
        
        for item in inventory_items_data:
            db.add(item)
        db.flush()
        
        # Create inventory transactions
        items = db.query(InventoryItem).filter(InventoryItem.farmer_id == farmer_id).all()
        today = date.today()
        
        for i, item in enumerate(items):
            transaction = InventoryTransaction(
                farmer_id=farmer_id,
                item_id=item.id,
                transaction_type="in",
                quantity=item.quantity,
                price_at_transaction=item.unit_cost,
                total_amount=item.quantity * item.unit_cost,
                notes=f"Initial stock for {item.name}",
                created_at=today - timedelta(days=30)
            )
            db.add(transaction)
        
        db.flush()
        
        # Create production records
        production_data = [
            Production(
                farmer_id=farmer_id,
                production_type="milk",
                quantity=500,
                unit="liters",
                production_date=today - timedelta(days=7),
                notes="Regular milking from dairy herd"
            ),
            Production(
                farmer_id=farmer_id,
                production_type="milk",
                quantity=520,
                unit="liters",
                production_date=today - timedelta(days=6),
                notes="Good quality milk"
            ),
            Production(
                farmer_id=farmer_id,
                production_type="eggs",
                quantity=1200,
                unit="eggs",
                production_date=today - timedelta(days=5),
                notes="From 300 laying hens"
            ),
            Production(
                farmer_id=farmer_id,
                production_type="milk",
                quantity=510,
                unit="liters",
                production_date=today - timedelta(days=4),
                notes="Normal production"
            ),
            Production(
                farmer_id=farmer_id,
                production_type="eggs",
                quantity=1250,
                unit="eggs",
                production_date=today - timedelta(days=3),
                notes="Peak production week"
            ),
        ]
        
        for prod in production_data:
            db.add(prod)
        
        db.flush()
        
        # Create sales records
        sales_data = [
            Sale(
                farmer_id=farmer_id,
                item_name="Fresh Milk",
                quantity=450,
                unit="liters",
                price_per_unit=20000,  # VND per liter
                total_amount=9000000,
                shipping_cost=200000,
                sale_date=today - timedelta(days=6),
                buyer_name="Local Dairy Cooperative",
                notes="Grade A milk sold to cooperative"
            ),
            Sale(
                farmer_id=farmer_id,
                item_name="Eggs",
                quantity=1000,
                unit="eggs",
                price_per_unit=3500,  # VND per egg
                total_amount=3500000,
                shipping_cost=150000,
                sale_date=today - timedelta(days=5),
                buyer_name="Farm Shop Central",
                notes="Sold in 30-egg crates"
            ),
            Sale(
                farmer_id=farmer_id,
                item_name="Fresh Milk",
                quantity=480,
                unit="liters",
                price_per_unit=20000,
                total_amount=9600000,
                shipping_cost=200000,
                sale_date=today - timedelta(days=3),
                buyer_name="Local Dairy Cooperative",
                notes="Regular weekly delivery"
            ),
            Sale(
                farmer_id=farmer_id,
                item_name="Eggs",
                quantity=1100,
                unit="eggs",
                price_per_unit=3500,
                total_amount=3850000,
                shipping_cost=150000,
                sale_date=today - timedelta(days=1),
                buyer_name="Farm Shop Central",
                notes="Premium grade eggs"
            ),
        ]
        
        for sale in sales_data:
            db.add(sale)
        
        db.flush()
        
        # Create analytics report for current month
        current_month_start = date(today.year, today.month, 1)
        current_month_end = today
        
        report = AnalyticsReport(
            farmer_id=farmer_id,
            period_type="monthly",
            start_date=current_month_start,
            end_date=current_month_end,
            total_revenue=26000000,  # VND
            total_feed_cost=30000000,
            total_medicine_cost=5000000,
            total_equipment_cost=0,
            total_labor_cost=0,
            total_other_cost=2000000,
            total_cost=37000000,
            net_profit=-11000000,  # Currently at a loss for demonstration
            profit_margin=-42.3,
            total_production_quantity=4230,
            production_unit="kg/eggs/liters",
            inventory_value=28500000,
            low_stock_items=0,
            production_efficiency=85.5,
            cost_per_unit=8743,
            revenue_per_unit=6148,
            recommendations=json.dumps([
                {
                    "title": "Optimize Feed Costs",
                    "description": "Feed costs are consuming 81% of revenue. This is the primary drag on profitability.",
                    "priority": "high",
                    "action": "Consider bulk purchasing, alternative feed sources, or improving feed conversion ratio.",
                    "estimated_impact": "Could reduce costs by 15-20% (~4.5M-7.5M VND)"
                },
                {
                    "title": "Increase Production Volume",
                    "description": "Current production levels are moderate. Growing herd size or improving per-animal productivity would help.",
                    "priority": "high",
                    "action": "Expand herd by 20-30% or implement breeding program to improve milk yield.",
                    "estimated_impact": "Could increase revenue by 25-30% (~6.5M-7.8M VND)"
                },
                {
                    "title": "Negotiate Better Prices",
                    "description": "Current selling price of milk (20k/L) might be below market. Eggs at 3.5k/egg is competitive.",
                    "priority": "medium",
                    "action": "Research market prices, consider direct-to-consumer sales, or join cooperative with better pricing.",
                    "estimated_impact": "Could increase revenue by 10-15% (~2.6M-3.9M VND)"
                }
            ]),
            is_analyzed=True,
        )
        
        db.add(report)
        
        # Create analytics report for previous month
        prev_month_start = date(today.year, today.month - 1 if today.month > 1 else 12, 1)
        prev_month_last_day = date(today.year if today.month > 1 else today.year - 1, 
                                   today.month - 1 if today.month > 1 else 12, 28)
        
        prev_report = AnalyticsReport(
            farmer_id=farmer_id,
            period_type="monthly",
            start_date=prev_month_start,
            end_date=prev_month_last_day,
            total_revenue=24000000,
            total_feed_cost=28000000,
            total_medicine_cost=4000000,
            total_equipment_cost=0,
            total_labor_cost=0,
            total_other_cost=1500000,
            total_cost=33500000,
            net_profit=-9500000,
            profit_margin=-39.6,
            total_production_quantity=3980,
            production_unit="kg/eggs/liters",
            inventory_value=26500000,
            low_stock_items=0,
            production_efficiency=82.0,
            cost_per_unit=8410,
            revenue_per_unit=6030,
            recommendations=json.dumps([]),
            is_analyzed=True,
        )
        
        db.add(prev_report)
        
        db.commit()
        print("✓ Inventory and Analytics sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding inventory and analytics data: {e}")
        db.rollback()
    finally:
        db.close()


seed_initial_inventory_and_analytics()

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
app.include_router(inventory.router)
app.include_router(analytics.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
