import shap
import xgboost as xgb
import numpy as np
import pandas as pd

# 1. Create a tiny model
X = pd.DataFrame(np.random.rand(100, 5), columns=list('abcde'))
y = (X['a'] > 0.5).astype(int)
model = xgb.XGBClassifier(n_estimators=10, max_depth=3, learning_rate=0.1)
model.fit(X, y)

print("XGBoost version:", xgb.__version__)
print("SHAP version:", shap.__version__)

try:
    print("Testing shap.TreeExplainer(model)...")
    explainer = shap.TreeExplainer(model)
    print("Success with model")
except Exception as e:
    print("Failed with model:", e)

try:
    print("Testing shap.TreeExplainer(model.get_booster())...")
    explainer = shap.TreeExplainer(model.get_booster())
    print("Success with booster")
except Exception as e:
    print("Failed with booster:", e)

try:
    print("Testing shap.Explainer(model)...")
    explainer = shap.Explainer(model)
    print("Success with Explainer(model)")
except Exception as e:
    print("Failed with Explainer(model):", e)
