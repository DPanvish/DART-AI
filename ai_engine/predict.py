import sys
import joblib
import pandas as pd
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

# Load Model
try:
    model = joblib.load("fraud_model.pkl")
except:
    # Fallback if running from the root directory
    model = joblib.load("ai_engine/fraud_model.pkl")

def predict(data_values):
    feature_names = ['Bidder_Tendency', 'Bidding_Ratio', 'Successive_Outbidding',
                     'Last_Bidding', 'Auction_Bids', 'Starting_Price_Average',
                     'Early_Bidding', 'Winning_Ratio', 'Auction_Duration']

    # Create a DataFrame for a single row
    input_df = pd.DataFrame([data_values], columns=feature_names)

    # Predict
    prediction = model.predict(input_df)

    if prediction[0] == 1:
        print("FRAUD")
    else:
        print("LEGIT")

if __name__ == "__main__":
    # We expect 9 arguments + script name = 10 items
    if len(sys.argv) < 10:
        print("Error: Expected 9 feature values.")
    else:
        # Convert command line string args to floats
        # sys.argv[0] is the script name, so we start from [1]
        try:
            inputs = [float(x) for x in sys.argv[1:]]
            predict(inputs)
        except ValueError:
            print("Error: All inputs must be numbers.")