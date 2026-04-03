import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_utils import train_and_cache_model, predict_failure

app = FastAPI(title="Machine Failure Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model
model, feature_columns, feature_stats, metrics = train_and_cache_model()

class PredictRequest(BaseModel):
    features: dict

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        data = req.features
        
        # 1. Map the 6 React inputs to the EXACT cleaned names the model expects
        mapped_data = {
            "Type": data.get("Type", "L"),
            "AirtemperatureK": float(data.get("AirTemperature", 0)),
            "ProcesstemperatureK": float(data.get("ProcessTemperature", 0)),
            "Rotationalspeedrpm": float(data.get("RotationalSpeed", 0)),
            "TorqueNm": float(data.get("Torque", 0)),
            "Toolwearmin": float(data.get("ToolWear", 0)),
            
            # 2. Provide default 0s for the missing columns the model was trained on
            "UDI": 0,
            "ProductID": 0,
            "TWF": 0,
            "HDF": 0,
            "PWF": 0,
            "OSF": 0,
            "RNF": 0
        }

        # 3. Pass the mapped 13-column dictionary to the updated predict function
        result = predict_failure(model, feature_columns, mapped_data)
        
        return result 

    except Exception as e:
        print(f"Prediction logic error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)