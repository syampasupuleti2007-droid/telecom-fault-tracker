#!/usr/bin/env python3
"""
Telecom Fault Tracker & Churn Prediction System
Inference script for predicting subscriber churn probability.
"""

import sys
import argparse
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

logging.basicConfig(level=logging.ERROR)

MODEL_PATH = Path(__file__).parent / "churn_model.joblib"


def load_or_train_model():
    """
    Loads model artifact, training a fresh one if absent.
    """
    if not MODEL_PATH.exists():
        from train_model import train_and_export_model
        model, _ = train_and_export_model()
        return model
    return joblib.load(MODEL_PATH)


def get_risk_tier(churn_prob: float) -> str:
    if churn_prob >= 0.80:
        return "CRITICAL"
    elif churn_prob >= 0.60:
        return "HIGH"
    elif churn_prob >= 0.35:
        return "MEDIUM"
    else:
        return "LOW"


def predict_single(model, tenure: int, call_drops: int, is_faulty: int, monthly_fee: float, complaint_count: int):
    features = pd.DataFrame([{
        "tenure_months": tenure,
        "call_drops": call_drops,
        "is_tower_faulty": is_faulty,
        "monthly_fee": monthly_fee,
        "complaint_count": complaint_count
    }])

    prob = float(model.predict_proba(features)[0, 1])
    risk_tier = get_risk_tier(prob)

    return {
        "churnProbability": round(prob, 4),
        "riskTier": risk_tier,
        "isHighRisk": prob >= 0.70,
        "inputFeatures": {
            "tenureMonths": tenure,
            "callDrops": call_drops,
            "isTowerFaulty": bool(is_faulty),
            "monthlyFee": monthly_fee,
            "complaintCount": complaint_count
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Predict subscriber churn probability using ML model.")
    parser.add_argument("--subscriber-id", type=int, default=None, help="Subscriber ID")
    parser.add_argument("--tenure", type=int, default=12, help="Tenure in months")
    parser.add_argument("--call-drops", type=int, default=5, help="Number of call drops")
    parser.add_argument("--is-faulty", type=int, choices=[0, 1], default=0, help="Tower fault status (0 or 1)")
    parser.add_argument("--monthly-fee", type=float, default=59.99, help="Monthly plan fee ($)")
    parser.add_argument("--complaint-count", type=int, default=1, help="Number of complaints logged")
    parser.add_argument("--batch", action="store_true", help="Run batch prediction for test suite")

    args = parser.parse_args()

    model = load_or_train_model()

    if args.batch:
        sample_batch = [
            {"subscriberId": 1, "tenure": 34, "call_drops": 2, "is_faulty": 0, "monthly_fee": 59.99, "complaint_count": 0},
            {"subscriberId": 2, "tenure": 8, "call_drops": 17, "is_faulty": 1, "monthly_fee": 39.99, "complaint_count": 4},
            {"subscriberId": 3, "tenure": 19, "call_drops": 14, "is_faulty": 1, "monthly_fee": 89.99, "complaint_count": 3},
            {"subscriberId": 4, "tenure": 52, "call_drops": 1, "is_faulty": 0, "monthly_fee": 59.99, "complaint_count": 1}
        ]
        results = []
        for item in sample_batch:
            res = predict_single(model, item["tenure"], item["call_drops"], item["is_faulty"], item["monthly_fee"], item["complaint_count"])
            res["subscriberId"] = item["subscriberId"]
            results.append(res)

        print(json.dumps(results, indent=2))
    else:
        res = predict_single(model, args.tenure, args.call_drops, args.is_faulty, args.monthly_fee, args.complaint_count)
        if args.subscriber_id is not None:
            res["subscriberId"] = args.subscriber_id
        print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
