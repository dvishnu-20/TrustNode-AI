# 🛡️ TrustNode AI

## Real-Time Behavioral Guardrail & Dynamic Friction Engine

> **TrustNode doesn't just detect risk — it dynamically decides how much friction a customer needs.**

TrustNode AI is a real-time fraud and transaction-risk management platform designed for modern e-commerce checkout flows.

Unlike traditional fraud systems that primarily evaluate transactions after a payment attempt, TrustNode continuously analyzes **behavioral signals, device risk, transaction velocity, ML-based anomalies, and historical patterns while the customer is still on the checkout page**.

Based on the calculated risk, TrustNode dynamically adapts the checkout experience:

* 🟢 **Green** → Frictionless checkout
* 🟡 **Yellow** → Targeted payment friction
* 🔴 **Red** → Strong verification / COD deposit

The goal is not to block every suspicious customer.

The goal is:

> **Detect → Predict → Decide → Intervene → Measure**

---

# 🚀 Key Features

## 1. Real-Time Behavioral Risk Detection

TrustNode collects non-sensitive behavioral telemetry from the checkout page.

Examples include:

* Time spent on checkout
* Field completion time
* Typing cadence
* Paste events
* Click frequency
* Checkout attempts
* Payment attempts
* Interaction velocity
* Pointer behavior statistics

TrustNode does **not** need to collect actual card numbers, CVVs, UPI PINs, or passwords.

Example telemetry:

```json
{
  "session_id": "S-8291",
  "event_type": "paste",
  "field": "card_number",
  "timestamp": 1725443000
}
```

Only the behavioral event is recorded.

---

# 2. 🧠 ML Anomaly Detector

TrustNode uses machine learning to identify checkout behavior that deviates significantly from normal customer behavior.

The initial implementation can use an **Isolation Forest** model for unsupervised anomaly detection.

### Example features

```text
avg_key_interval
std_key_interval
paste_count
paste_frequency
time_on_page
field_completion_time
click_count
click_frequency
checkout_attempts
payment_attempts
time_between_attempts
```

The model produces an anomaly score:

```text
0.00 → Normal
1.00 → Highly anomalous
```

Example:

```text
Anomaly Score: 0.91
Anomaly Level: HIGH
```

The ML result is combined with rule-based signals rather than directly blocking a customer.

---

# 3. 📱 Device-Risk Simulation

TrustNode includes a simulated device intelligence layer.

Each device can have a risk profile based on historical activity.

Example signals:

* Orders from device
* Failed payment attempts
* COD orders
* COD cancellations
* Previous RTOs
* Number of accounts associated with the device
* Checkout velocity
* Device history

Example:

```text
Device: DEV-48291

Orders:              14
Failed Payments:      6
COD Orders:           8
COD Returns:          5
Accounts Seen:        4

Device Risk:         78/100
```

For the prototype, this is simulated device intelligence. A production implementation can consume signals from a dedicated fraud/device-risk provider.

---

# 4. 📊 Historical Analytics

TrustNode stores risk events and transaction outcomes in PostgreSQL to provide historical analytics.

The merchant can monitor:

* Total checkout sessions
* Green / Yellow / Red distribution
* Risk trends
* Payment method usage
* Card restrictions
* UPI conversions
* COD deposits
* Deposit conversion rate
* Payment failures
* RTO trends
* High-risk devices
* High-risk customers/sessions

Example:

```text
Risk Distribution

GREEN     72%
YELLOW    19%
RED        9%
```

---

# 5. 📦 RTO Prediction

For COD transactions, TrustNode can predict the probability that an order may result in Return to Origin (RTO).

The RTO prediction model can consider:

```text
risk_score
device_risk
customer_order_history
previous_cod_orders
previous_rto_count
cod_cancellation_rate
order_value
checkout_behavior
order_velocity
```

Example:

```text
Order Value:       ₹2,000
Risk Score:           86
Device Risk:          79

RTO Probability:      84%
```

TrustNode can then recommend:

```text
REQUIRE ₹200 DEPOSIT
```

instead of immediately rejecting the order.

---

# 6. 💳 Dynamic Payment Routing

TrustNode introduces adaptive friction based on risk.

## Green Zone

```text
Risk Score: 0–39
```

All supported payment methods remain available.

```text
○ UPI
○ Credit / Debit Card
○ Cash on Delivery
```

---

## Yellow Zone

```text
Risk Score: 40–74
```

TrustNode introduces targeted friction.

Example:

```text
🔐 For your security, please use UPI.

● UPI
○ Credit / Debit Card — Restricted
○ Cash on Delivery
```

The customer is not necessarily blocked.

Instead, TrustNode attempts to move the customer toward a more strongly authenticated payment method.

---

## Red Zone

```text
Risk Score: 75–100
```

Higher-risk actions are required.

For a COD order:

```text
🔐 Additional verification required

A ₹200 booking deposit is required
to confirm your COD order.

[ PAY ₹200 SECURELY ]
```

---

# 7. 💰 Razorpay Payment Link Integration

TrustNode can generate a Razorpay Payment Link for high-risk COD orders requiring a deposit.

Example flow:

```text
Customer selects COD
        ↓
TrustNode evaluates risk
        ↓
Risk = RED
        ↓
RTO probability is high
        ↓
Deposit required
        ↓
Generate Razorpay Payment Link
        ↓
Customer pays deposit
        ↓
COD order confirmed
```

For development and demonstrations, use Razorpay's test/sandbox environment and keep all credentials on the backend.

---

# 8. 🔌 Third-Party Risk Signal Adapter

TrustNode is designed to consume external fraud and risk signals.

Instead of replacing existing fraud engines, TrustNode can act as the **real-time execution and checkout UX layer**.

Conceptually:

```text
External Risk Provider
        ↓
Risk Signal Adapter
        ↓
TrustNode Normalized Signals
        ↓
Risk Aggregator
        ↓
Policy Engine
        ↓
Checkout Action
```

The adapter normalizes different provider formats into a common TrustNode schema.

Example:

```json
{
  "provider": "external_risk_engine",
  "session_id": "S-8291",
  "risk_score": 72,
  "signals": [
    {
      "type": "device_risk",
      "score": 80
    },
    {
      "type": "velocity",
      "score": 65
    }
  ]
}
```

A mock third-party adapter can be used during development.

---

# 9. 🧮 Hybrid Risk Engine

TrustNode combines multiple sources of intelligence.

```text
Behavioral Rules
       +
ML Anomaly Detection
       +
Device Risk
       +
Third-Party Risk
       +
RTO Probability
       ↓
Risk Aggregator
       ↓
Final Risk Score
```

Example:

```text
Behavioral Score:       72
ML Anomaly Score:       89
Device Risk:            76
Third-Party Score:      70
RTO Probability:        84

Final Risk:             83
Risk Zone:              RED
```

---

# 10. 🧠 Explainable Risk Decisions

TrustNode does not only show a risk number.

It explains why the risk increased.

Example:

```text
RISK SCORE: 83
ZONE: RED

Contributing Signals:

⚠ Rapid paste event             +15
⚠ Abnormal typing cadence      +20
⚠ High checkout velocity       +15
⚠ Device risk                  +15
⚠ ML anomaly                   +18

Recommended Action:

REQUIRE COD DEPOSIT
```

This provides transparency for merchants and makes risk decisions easier to understand.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────┐
                         │    CUSTOMER     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ REACT CHECKOUT  │
                         │                 │
                         │ Telemetry Hook  │
                         └────────┬────────┘
                                  │
                           REST / WebSocket
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     FASTAPI     │
                         │     BACKEND     │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       Behavioral Engine     Device Risk       Third-Party
              │                   │              Signals
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  ML ANOMALY     │
                         │    DETECTOR     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  RTO PREDICTOR  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ RISK AGGREGATOR │
                         │                 │
                         │     0–100       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  POLICY ENGINE  │
                         └────────┬────────┘
                                  │
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
                GREEN          YELLOW           RED
                   │              │              │
                   ▼              ▼              ▼
              Normal Pay      UPI/Card       Deposit /
                              Friction        Verification
                                                  │
                                                  ▼
                                           ┌────────────┐
                                           │  RAZORPAY  │
                                           └────────────┘

                                  │
                                  ▼
                         ┌─────────────────┐
                         │    POSTGRESQL   │
                         │                 │
                         │ History         │
                         │ Risk Events     │
                         │ Orders          │
                         │ Devices         │
                         │ Predictions     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ MERCHANT        │
                         │ COMMAND CENTER  │
                         └─────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* WebSocket
* Recharts

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic
* WebSockets

## Database

* PostgreSQL

## Machine Learning

* Python
* scikit-learn
* Isolation Forest
* Logistic Regression / Random Forest for RTO prediction

## Payment

* Razorpay APIs
* Razorpay Payment Links

## Deployment

* Docker
* Cloud-hosted React frontend
* Cloud-hosted FastAPI backend
* Managed PostgreSQL

---

# 📁 Project Structure

```text
TrustNode/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Checkout.jsx
│   │   │   ├── PaymentMethods.jsx
│   │   │   ├── RiskIndicator.jsx
│   │   │   ├── RiskGraph.jsx
│   │   │   └── AlertStream.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useTelemetry.js
│   │   │
│   │   ├── pages/
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Intelligence.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   ├── services/
│   │   │   └── websocket.js
│   │   │
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── telemetry.py
│   │   │   ├── risk.py
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── models/
│   │   │
│   │   ├── services/
│   │   │   ├── risk_engine.py
│   │   │   ├── anomaly_detector.py
│   │   │   ├── device_risk.py
│   │   │   ├── rto_predictor.py
│   │   │   ├── friction_engine.py
│   │   │   └── razorpay.py
│   │   │
│   │   ├── adapters/
│   │   │   ├── base.py
│   │   │   └── third_party.py
│   │   │
│   │   └── websocket/
│   │       └── manager.py
│   │
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
│
├── ml/
│   ├── anomaly_model.pkl
│   ├── rto_model.pkl
│   ├── train_anomaly.py
│   └── train_rto.py
│
├── database/
│   └── schema.sql
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🗄️ Database Design

TrustNode uses PostgreSQL as its primary persistent data store.

### Main tables

```text
customers
devices
checkout_sessions
telemetry_events
risk_assessments
risk_signals
orders
payment_attempts
rto_predictions
third_party_signals
friction_actions
model_predictions
```

### Relationship

```text
CUSTOMERS
    │
    ├── DEVICES
    │
    ├── ORDERS
    │      ├── PAYMENT_ATTEMPTS
    │      └── RTO_PREDICTIONS
    │
    └── CHECKOUT_SESSIONS
           │
           ├── TELEMETRY_EVENTS
           ├── RISK_ASSESSMENTS
           │       ├── RISK_SIGNALS
           │       └── MODEL_PREDICTIONS
           │
           ├── THIRD_PARTY_SIGNALS
           └── FRICTION_ACTIONS
```

---

# 🔄 Risk Decision Flow

```text
1. Customer opens checkout
              ↓
2. TrustNode creates session
              ↓
3. Behavioral telemetry begins
              ↓
4. Events sent to FastAPI
              ↓
5. Behavioral risk calculated
              ↓
6. ML anomaly score calculated
              ↓
7. Device risk evaluated
              ↓
8. External signals evaluated
              ↓
9. RTO prediction calculated if required
              ↓
10. Risk scores aggregated
              ↓
11. Policy engine selects action
              ↓
12. Checkout dynamically changes
              ↓
13. Merchant dashboard updates
              ↓
14. Decision stored in PostgreSQL
```

---

# 🎯 Risk Zones

|  Score | Zone      | Action                        |
| -----: | --------- | ----------------------------- |
|   0–39 | 🟢 Green  | Normal checkout               |
|  40–74 | 🟡 Yellow | Introduce targeted friction   |
| 75–100 | 🔴 Red    | Require stronger verification |

These thresholds are configurable and should be tuned using real evaluation data in a production system.

---

# ⚡ Example: Normal Customer

```text
Customer opens checkout
        ↓
Normal typing
        ↓
No suspicious paste
        ↓
Normal checkout duration
        ↓
Device risk = 8
        ↓
ML anomaly = 0.08
        ↓
Final risk = 15
        ↓
GREEN
        ↓
All payment methods available
```

---

# ⚠️ Example: Suspicious Customer

```text
Customer opens checkout
        ↓
Rapid paste
        ↓
Abnormal typing cadence
        ↓
Multiple checkout attempts
        ↓
ML anomaly = 0.82
        ↓
Final risk = 63
        ↓
YELLOW
        ↓
Card restricted
        ↓
UPI recommended
```

---

# 🚨 Example: High-Risk COD

```text
Customer opens checkout
        ↓
High-risk device
        ↓
Multiple recent attempts
        ↓
Abnormal behavior
        ↓
ML anomaly = 0.91
        ↓
Final risk = 87
        ↓
RED
        ↓
Customer selects COD
        ↓
RTO prediction = 84%
        ↓
₹200 deposit required
        ↓
Razorpay Payment Link
        ↓
Deposit successful
        ↓
COD order confirmed
```

---

# 🔌 API Overview

## Telemetry

```http
POST /api/v1/telemetry
```

Records behavioral events.

---

## Risk

```http
GET /api/v1/risk/{session_id}
```

Returns the current risk assessment.

Example:

```json
{
  "session_id": "S-8291",
  "risk_score": 83,
  "zone": "RED",
  "action": "REQUIRE_COD_DEPOSIT"
}
```

---

## Device Risk

```http
GET /api/v1/device-risk/{device_id}
```

Returns device risk information.

---

## RTO Prediction

```http
POST /api/v1/rto/predict
```

Returns the predicted RTO probability.

---

## Analytics

```http
GET /api/v1/analytics/overview
```

Returns merchant analytics.

---

## WebSocket

```text
/ws/risk/{session_id}
```

Provides real-time risk updates.

---

# 🔐 Security & Privacy

TrustNode is designed around minimizing sensitive data collection.

The telemetry layer should collect **behavioral metadata rather than sensitive payment information**.

Never store:

```text
❌ Card numbers
❌ CVV
❌ UPI PIN
❌ Passwords
❌ Authentication secrets
```

Use:

```text
✅ Event type
✅ Timing information
✅ Field identifier
✅ Session identifier
✅ Aggregated behavioral statistics
```

Production deployments should additionally implement:

* HTTPS
* Secure WebSockets
* Environment-based secrets
* Database encryption where appropriate
* Access control
* API authentication
* Rate limiting
* Audit logging
* Data retention policies
* PCI/security compliance requirements applicable to the deployment

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/trustnode

RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

FRONTEND_URL=http://localhost:5173

ML_ANOMALY_MODEL_PATH=ml/anomaly_model.pkl
RTO_MODEL_PATH=ml/rto_model.pkl
```

Never commit `.env` to Git.

Add:

```text
.env
```

to `.gitignore`.

---

# 🚀 Local Development

## Prerequisites

Install:

* Node.js
* Python 3.10+
* PostgreSQL
* Git

---

## Clone the repository

```bash
git clone <your-repository-url>
cd TrustNode
```

---

# Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Demo Mode

TrustNode includes a demonstration workflow designed for hackathons.

### Scenario

1. Open the checkout page.
2. Start as a normal customer.
3. Observe a Green risk score.
4. Perform rapid simulated interactions.
5. Trigger Yellow risk.
6. Watch card payment become restricted.
7. Continue suspicious behavior.
8. Trigger Red risk.
9. Select COD.
10. TrustNode predicts high RTO probability.
11. A deposit requirement appears.
12. Generate a Razorpay test Payment Link.
13. Watch the Merchant Command Center update in real time.

---

# 🎬 Hackathon Demo

The recommended demo layout is:

```text
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│   CUSTOMER CHECKOUT  │   MERCHANT COMMAND       │
│                      │   CENTER                 │
│                      │                          │
│   Payment Methods    │   Risk Score: 18         │
│                      │   GREEN                  │
│   UPI                │                          │
│   Card               │   Live Events            │
│   COD                │                          │
│                      │                          │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

Then intentionally trigger suspicious behavior.

The judge should see:

```text
18 → 48 → 67 → 87
```

while the checkout changes:

```text
Normal
   ↓
Card Restricted
   ↓
COD Deposit Required
```

---

# 📈 Merchant Command Center

The dashboard provides real-time visibility into:

### Active Sessions

```text
127
```

### Green

```text
94
```

### Yellow

```text
21
```

### Red

```text
12
```

### Friction Actions

```text
38
```

### Recent Alerts

```text
⚠ Rapid paste detected
⚠ High checkout velocity
⚠ ML anomaly detected
⚠ High device risk
```

---

# 📊 Analytics Dashboard

Example metrics:

```text
Total Sessions
Risk Events
Yellow Events
Red Events
Card Restrictions
UPI Conversions
COD Deposits
Deposit Conversion Rate
RTO Predictions
```

Example:

```text
FRICTION PERFORMANCE

Card Restrictions:       142
UPI Conversions:          97

COD Deposits Requested:   64
Deposits Completed:       51

Deposit Conversion:     79.7%
```

Metrics shown during a prototype/demo should be clearly identified as simulated where applicable.

---

# 🤖 Machine Learning Roadmap

## Phase 1

Rule-based behavioral risk scoring.

## Phase 2

Isolation Forest anomaly detection.

## Phase 3

RTO prediction model.

## Phase 4

Model evaluation and calibration.

## Phase 5

Continuous model improvement using validated historical outcomes.

## Phase 6

Advanced risk modeling and provider signal integration.

---

# 🗺️ Development Roadmap

## MVP

* React checkout
* Behavioral telemetry
* FastAPI backend
* PostgreSQL
* Risk scoring
* Green / Yellow / Red
* Dynamic payment friction
* WebSocket dashboard
* Razorpay test integration

## Advanced Version

* ML anomaly detection
* Device risk
* RTO prediction
* Historical analytics
* Third-party risk adapter
* Model monitoring
* Production deployment

---

# 🏆 Why TrustNode?

Traditional fraud prevention often follows:

```text
Transaction
     ↓
Fraud Check
     ↓
Approve / Reject
```

TrustNode follows:

```text
Behavior
     ↓
Real-Time Risk
     ↓
Prediction
     ↓
Adaptive Friction
     ↓
Payment
     ↓
Outcome
     ↓
Analytics
```

The fundamental idea is:

> **Not every suspicious customer should be blocked.**

Instead, TrustNode applies **risk-proportional friction**.

Low-risk customers get a seamless experience.

Suspicious customers get targeted verification.

High-risk COD transactions require a financial commitment before fulfillment.

---

# 💡 Product Vision

TrustNode can evolve into a merchant-facing **real-time transaction risk orchestration platform**.

Future capabilities can include:

* Advanced behavioral biometrics
* Real device intelligence
* Account takeover detection
* Promo abuse detection
* Bot detection
* Payment fraud detection
* RTO optimization
* Merchant-specific risk policies
* Third-party fraud intelligence
* Automated risk policy learning
* Real-time model monitoring

---

# 📜 Disclaimer

TrustNode is a prototype designed for demonstration and development purposes.

Risk scores, device signals, behavioral heuristics, RTO predictions, and simulated third-party signals should not be treated as definitive evidence of fraud.

Production use requires appropriate security, privacy, compliance, model validation, false-positive analysis, and integration with authorized payment/fraud infrastructure.

---

# 👥 Team

**Project:** TrustNode AI
**Track:** AI Risk Manager

### Contributors

Add your team members here.

---

# ⭐ Core Principle

```text
                 TRUSTNODE

                  OBSERVE
                     ↓
                  DETECT
                     ↓
                  PREDICT
                     ↓
                  DECIDE
                     ↓
                 INTERVENE
                     ↓
                  MEASURE
                     ↓
                 LEARN
```

> **TrustNode — Turn fraud detection into real-time action.**
