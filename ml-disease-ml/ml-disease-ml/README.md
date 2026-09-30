# ML Disease Model
Synthetic demonstration dataset matching D001, D002 and D003.
NOT clinical training data and NOT for diagnosis or medical decisions.

Install:
pip install -r requirements.txt

Train:
python train_model.py

Predict:
echo {"symptoms":["increased thirst","frequent urination"]} | python predict.py
