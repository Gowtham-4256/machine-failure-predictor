import pandas as pd
from xgboost import XGBClassifier
import joblib

def train_and_save():
    df = pd.read_csv('ai4i2020.csv')

    # 1. CLEAN THE COLUMN NAMES (The fix!)
    # This removes [ ], <, and > which XGBoost hates
    df.columns = df.columns.str.replace('[', '', regex=False).str.replace(']', '', regex=False).str.replace('<', '', regex=False)
    
    # 2. Map Type to numeric
    type_map = {'L': 0, 'M': 1, 'H': 2}
    df['Type'] = df['Type'].map(type_map)

    # 3. Use the NEW cleaned names
    # Notice the brackets are gone now
    features = ['Type', 'Air temperature K', 'Process temperature K', 
                'Rotational speed rpm', 'Torque Nm', 'Tool wear min']
    
    X = df[features]
    y = df['Machine failure']

    print("Training with cleaned feature names...")
    model = XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X, y)

    joblib.dump(model, 'failure_model.pkl')
    print("✅ Success! 'failure_model.pkl' created.")

if __name__ == "__main__":
    train_and_save()