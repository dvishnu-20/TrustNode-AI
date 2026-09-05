-- TrustNode AI PostgreSQL Schema

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_ref VARCHAR UNIQUE,
    phone_hash VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_customers_customer_ref ON customers (customer_ref);
CREATE INDEX ix_customers_phone_hash ON customers (phone_hash);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_ref VARCHAR UNIQUE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    risk_score FLOAT DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    failed_payments INTEGER DEFAULT 0,
    cod_orders INTEGER DEFAULT 0,
    cod_returns INTEGER DEFAULT 0,
    accounts_seen INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_devices_device_ref ON devices (device_ref);

CREATE TABLE checkout_sessions (
    id SERIAL PRIMARY KEY,
    session_ref VARCHAR UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    device_id INTEGER REFERENCES devices(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    final_risk_score FLOAT,
    risk_zone VARCHAR,
    final_action VARCHAR
);
CREATE INDEX ix_checkout_sessions_session_ref ON checkout_sessions (session_ref);

CREATE TABLE telemetry_events (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES checkout_sessions(id),
    event_type VARCHAR,
    field_name VARCHAR,
    event_value VARCHAR,
    timestamp FLOAT,
    metadata_json JSONB
);
CREATE INDEX ix_telemetry_events_event_type ON telemetry_events (event_type);

CREATE TABLE risk_assessments (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES checkout_sessions(id),
    behavior_score FLOAT,
    ml_anomaly_score FLOAT,
    device_score FLOAT,
    third_party_score FLOAT,
    rto_probability FLOAT,
    final_risk_score FLOAT,
    risk_zone VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_signals (
    id SERIAL PRIMARY KEY,
    risk_assessment_id INTEGER REFERENCES risk_assessments(id),
    signal_type VARCHAR,
    signal_value FLOAT,
    weight FLOAT,
    description VARCHAR
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_ref VARCHAR UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    device_id INTEGER REFERENCES devices(id),
    session_id INTEGER REFERENCES checkout_sessions(id),
    amount FLOAT,
    payment_method VARCHAR,
    risk_score FLOAT,
    rto_probability FLOAT,
    order_status VARCHAR DEFAULT 'PENDING',
    rto_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_orders_order_ref ON orders (order_ref);

CREATE TABLE payment_attempts (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    payment_method VARCHAR,
    amount FLOAT,
    status VARCHAR,
    provider VARCHAR,
    provider_reference VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rto_predictions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    probability FLOAT,
    risk_level VARCHAR,
    model_version VARCHAR,
    features_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE third_party_signals (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES checkout_sessions(id),
    provider VARCHAR,
    external_risk_score FLOAT,
    signal_data JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friction_actions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES checkout_sessions(id),
    action_type VARCHAR,
    triggered_by VARCHAR,
    payment_method VARCHAR,
    result VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_predictions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES checkout_sessions(id),
    model_type VARCHAR,
    model_version VARCHAR,
    prediction FLOAT,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
