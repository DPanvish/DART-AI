import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
from config import feature_names

# Load Data
try:
    df = pd.read_csv("shill_bidding.csv")
except FileNotFoundError:
    print("Error: shill_bidding.csv not found. Please ensure the dataset is in the current directory.")
    sys.exit(1)
    
# Validate columns exist
missing_features = set(feature_names + ["Class"]) - set(df.columns)
if missing_features:
    print(f"Error: Missing columns in dataset: {missing_features}")
    sys.exit(1)

# Select Features (X) and Target (y)
X = df[feature_names]
y = df["Class"]

# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Model
print("Training Random Forest Model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate Model
y_pred = model.predict(X_test)
print(f"Accurscy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save Model
joblib.dump(model, "fraud_model.pkl")
print("Model saved as 'fraud_model.pkl'")
