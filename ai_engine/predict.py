import sys
import os
import joblib
import pandas as pd
from config import feature_names
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

current_script_folder = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_script_folder, 'fraud_model.pkl')

# Load Model
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    print(f"Error: Model not found at {model_path}")
    print("Make sure you ran train_model.py inside the ai_engine folder first!")
    sys.exit(1)

def predict(data_values):

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