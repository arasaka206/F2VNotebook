from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

sale_payload = {
    'item_name': 'Eggs',
    'quantity': 200,
    'unit_price': 0.5,
    'total_amount': 100.0,
    'sale_date': '2026-06-01'
}
production_payload = {
    'product_name': 'Eggs',
    'quantity': 200,
    'unit_cost': 0.15,
    'production_date': '2026-06-01'
}

resp = client.post('/api/analytics/sales', json=sale_payload)
print('create sale', resp.status_code, resp.json())
resp = client.post('/api/analytics/productions', json=production_payload)
print('create production', resp.status_code, resp.json())

resp = client.get('/api/analytics/chart-data', params={'period_type': 'monthly', 'months': 3})
print('chart-data', resp.status_code)
print(json.dumps(resp.json(), indent=2))

resp = client.get('/api/analytics/summary', params={'period_type': 'monthly'})
print('summary', resp.status_code)
print(json.dumps(resp.json(), indent=2))
