import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load Data
df = pd.read_csv("shill_bidding.csv")

# Select Features (X) and Target (y)
features = ["Bidder_Tendency", "Bidding_Ratio", "Successive_Outbidding", "Last_Bidding", "Auction_Bids", "Starting_Price_Average", "Early_Bidding", "Winning_Ratio", "Auction_Duration"]
X = df[features]
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
