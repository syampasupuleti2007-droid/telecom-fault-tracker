#!/usr/bin/env python3
"""
Telecom Fault Tracker & Churn Prediction System
Machine Learning Model Training Pipeline

Trains a Random Forest classifier to predict subscriber churn risk
based on usage metrics, network fault status, call drops, and complaints.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from pathlib import Path

# Machine Learning libraries
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report, confusion_matrix
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ChurnTrainer")

MODEL_OUTPUT_PATH = Path(__file__).parent / "churn_model.joblib"
METADATA_OUTPUT_PATH = Path(__file__).parent / "model_metadata.json"


def generate_synthetic_telecom_data(n_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic telecom subscriber dataset for churn modeling.
    """
    np.random.seed(random_seed)

    tenure_months = np.random.randint(1, 72, size=n_samples)
    call_drops = np.random.poisson(lam=6, size=n_samples)
    is_tower_faulty = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    monthly_fee = np.random.choice([39.99, 59.99, 89.99, 119.99], size=n_samples, p=[0.3, 0.4, 0.2, 0.1])
    complaint_count = np.random.poisson(lam=1.5, size=n_samples) + (is_tower_faulty * 2)

    # Churn probability logit formula based on domain rules
    logit = (
        -1.5
        - (0.05 * tenure_months)
        + (0.35 * call_drops)
        + (1.80 * is_tower_faulty)
        + (0.45 * complaint_count)
        + (0.008 * (monthly_fee - 60))
    )

    prob = 1 / (1 + np.exp(-logit))
    churned = (prob > np.random.uniform(0, 1, size=n_samples)).astype(int)

    df = pd.DataFrame({
        "tenure_months": tenure_months,
        "call_drops": call_drops,
        "is_tower_faulty": is_tower_faulty,
        "monthly_fee": monthly_fee,
        "complaint_count": complaint_count,
        "churned": churned
    })

    logger.info(f"Generated synthetic dataset with {len(df)} records. Churn rate: {df['churned'].mean():.2%}")
    return df


def fetch_database_data():
    """
    Attempts to read subscriber dataset directly from MySQL DB if available.
    """
    try:
        import mysql.connector
        db_url = os.getenv("DB_URL", "localhost")
        conn = mysql.connector.connect(
            host=db_url,
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "root"),
            database="telecom_fault_tracker"
        )
        query = """
            SELECT
                s.tenure_months,
                s.call_drops,
                IF(t.is_faulty, 1, 0) AS is_tower_faulty,
                p.monthly_fee,
                (SELECT COUNT(*) FROM complaints c WHERE c.subscriber_id = s.subscriber_id) AS complaint_count,
                IF(s.churned, 1, 0) AS churned
            FROM subscribers s
            JOIN towers t ON s.connected_tower_id = t.tower_id
            JOIN plans p ON s.plan_id = p.plan_id
        """
        df = pd.read_sql(query, conn)
        conn.close()
        logger.info(f"Loaded {len(df)} records from MySQL database.")
        return df
    except Exception as e:
        logger.info(f"MySQL connection unavailable ({e}). Using synthetic dataset generator...")
        return generate_synthetic_telecom_data()


def train_and_export_model():
    """
    Trains Random Forest classifier and exports model artifact.
    """
    df = fetch_database_data()

    feature_cols = ["tenure_months", "call_drops", "is_tower_faulty", "monthly_fee", "complaint_count"]
    target_col = "churned"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), ["tenure_months", "call_drops", "monthly_fee", "complaint_count"]),
            ("passthrough", "passthrough", ["is_tower_faulty"])
        ]
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            min_samples_split=5,
            random_state=42,
            class_weight="balanced"
        ))
    ])

    logger.info("Fitting Random Forest Model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    logger.info("=========================================================")
    logger.info("Model Evaluation Metrics:")
    logger.info(f"  Accuracy: {acc:.4f}")
    logger.info(f"  ROC-AUC Score: {auc:.4f}")
    logger.info("\nClassification Report:\n" + classification_report(y_test, y_pred))
    logger.info("=========================================================")

    # Feature Importance
    rf_clf = pipeline.named_steps["classifier"]
    importances = rf_clf.feature_importances_
    raw_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    clean_names = [name.split("__")[-1] for name in raw_names]
    feat_imp = dict(zip(clean_names, [round(float(x), 4) for x in importances]))

    # Export Model Artifact
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    logger.info(f"Saved trained model to: {MODEL_OUTPUT_PATH}")

    # Export Metadata
    meta = {
        "accuracy": round(float(acc), 4),
        "roc_auc": round(float(auc), 4),
        "feature_importances": feat_imp,
        "feature_cols": clean_names
    }
    with open(METADATA_OUTPUT_PATH, "w") as f:
        json.dump(meta, f, indent=2)

    logger.info(f"Saved model metadata to: {METADATA_OUTPUT_PATH}")
    return pipeline, meta


if __name__ == "__main__":
    train_and_export_model()
