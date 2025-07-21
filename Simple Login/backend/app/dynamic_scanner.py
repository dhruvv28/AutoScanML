import os
import torch
import numpy as np
from art.attacks.evasion import FastGradientMethod
from art.estimators.classification import PyTorchClassifier
from art.attacks.inference.membership_inference import MembershipInferenceBlackBoxRuleBased
from art.utils import load_dataset
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

def check_adversarial_robustness(model, x_test, y_test):
    """
    Test model's susceptibility to adversarial examples using FGSM attack.
    Returns: dict with results and recommendations.
    """
    results = {}
    # Wrap the model with ART's PyTorchClassifier
    classifier = PyTorchClassifier(
        model=model,
        loss=torch.nn.CrossEntropyLoss(),
        optimizer=torch.optim.Adam(model.parameters()),
        input_shape=x_test.shape[1:],
        nb_classes=len(np.unique(y_test))
    )
    # Generate adversarial examples
    attack = FastGradientMethod(estimator=classifier, eps=0.2)
    x_test_adv = attack.generate(x=x_test)
    # Evaluate accuracy on adversarial examples
    acc = np.sum(np.argmax(classifier.predict(x_test_adv), axis=1) == np.argmax(y_test, axis=1)) / y_test.shape[0]
    results['adversarial_accuracy'] = acc
    if acc < 0.5:
        results['flag'] = True
        results['message'] = (
            'Model is highly susceptible to adversarial attacks. '
            'Consider adversarial training or input preprocessing.'
        )
    else:
        results['flag'] = False
        results['message'] = 'Model shows reasonable robustness to adversarial attacks.'
    return results

def check_membership_inference(model, x_train, y_train, x_test, y_test):
    """
    Test model's vulnerability to membership inference attacks.
    Returns: dict with results and recommendations.
    """
    results = {}
    classifier = PyTorchClassifier(
        model=model,
        loss=torch.nn.CrossEntropyLoss(),
        optimizer=torch.optim.Adam(model.parameters()),
        input_shape=x_train.shape[1:],
        nb_classes=len(np.unique(y_train))
    )
    attack = MembershipInferenceBlackBoxRuleBased(classifier)
    attack.fit(x_train, y_train, x_test, y_test)
    inferred_train = attack.infer(x_train, y_train)
    inferred_test = attack.infer(x_test, y_test)
    train_acc = np.mean(inferred_train)
    test_acc = np.mean(inferred_test)
    results['train_inference_accuracy'] = train_acc
    results['test_inference_accuracy'] = test_acc
    if train_acc > 0.7:
        results['flag'] = True
        results['message'] = (
            'Model is vulnerable to membership inference attacks. '
            'Consider regularization, differential privacy, or reducing model complexity.'
        )
    else:
        results['flag'] = False
        results['message'] = 'Model shows reasonable privacy against membership inference.'
    return results

def check_input_validation(api_url, test_cases):
    """
    Test API endpoint for input validation by sending malformed or adversarial inputs.
    Returns: list of issues found and recommendations.
    """
    import requests
    issues = []
    for case in test_cases:
        try:
            response = requests.post(api_url, json=case)
            if response.status_code == 200:
                # Check for error messages or unexpected outputs
                if 'error' not in response.text.lower() and 'exception' not in response.text.lower():
                    issues.append({
                        'input': case,
                        'message': 'API did not reject malformed input. Add stricter input validation.'
                    })
        except Exception as e:
            issues.append({'input': case, 'message': f'API call failed: {e}'})
    return issues

def check_model_extraction(api_url, benign_inputs, n_queries=100):
    """
    Simulate model extraction by querying the API with benign inputs and checking for excessive information leakage.
    Returns: dict with results and recommendations.
    """
    import requests
    responses = []
    for i in range(n_queries):
        inp = benign_inputs[i % len(benign_inputs)]
        try:
            response = requests.post(api_url, json=inp)
            responses.append(response.json())
        except Exception:
            continue
    # Simple heuristic: if outputs are highly detailed or consistent, flag as risk
    if len(set([str(r) for r in responses])) < n_queries * 0.5:
        return {
            'flag': True,
            'message': 'API responses are too consistent or detailed. Consider output obfuscation, rate limiting, or watermarking.'
        }
    else:
        return {
            'flag': False,
            'message': 'API does not appear to be easily extractable with simple queries.'
        }

def check_api_authentication(api_url):
    """
    Test if API endpoint requires authentication.
    Returns: dict with results and recommendations.
    """
    import requests
    try:
        response = requests.post(api_url, json={})
        if response.status_code == 401 or response.status_code == 403:
            return {'flag': False, 'message': 'API requires authentication.'}
        else:
            return {'flag': True, 'message': 'API does not require authentication. Add authentication checks!'}
    except Exception as e:
        return {'flag': True, 'message': f'API call failed: {e}'}

def run_dynamic_scanner(file_path):
    # Dummy implementation: replace with actual logic to load model and data
    # and call your dynamic checks (e.g., input validation, API checks, etc.)
    # Return a list of dicts, each with 'title', 'description', and optionally 'details'
    return [
        {
            'title': 'Dynamic Input Validation',
            'description': 'No input validation detected in model forward method.',
            'details': 'Model does not check for input shape or type.'
        }
    ]

def run_adversarial_scanner(file_path):
    # Dummy implementation: replace with actual logic to load model and data
    # and call your adversarial checks (e.g., adversarial robustness, membership inference, etc.)
    # Return a list of dicts, each with 'title', 'description', and optionally 'details'
    return [
        {
            'title': 'Adversarial Robustness',
            'description': 'Model is highly susceptible to adversarial attacks.',
            'details': 'FGSM attack reduced accuracy to 10%.'
        }
    ]

# Example usage (to be replaced with actual model and data in production)
if __name__ == '__main__':
    # Dummy model and data for demonstration
    # In production, load your actual model and data
    import torch.nn as nn
    class DummyModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc = nn.Linear(10, 2)
        def forward(self, x):
            return self.fc(x)
    model = DummyModel()
    x_train = np.random.rand(100, 10).astype(np.float32)
    y_train = np.eye(2)[np.random.randint(0, 2, 100)]
    x_test = np.random.rand(20, 10).astype(np.float32)
    y_test = np.eye(2)[np.random.randint(0, 2, 20)]

    print('Adversarial Robustness:', check_adversarial_robustness(model, x_test, y_test))
    print('Membership Inference:', check_membership_inference(model, x_train, y_train, x_test, y_test))
    # For API checks, provide your actual API URL and test cases
    # print('API Input Validation:', check_input_validation('http://localhost:5000/predict', [{...}, {...}]))
    # print('API Authentication:', check_api_authentication('http://localhost:5000/predict'))
    # print('Model Extraction:', check_model_extraction('http://localhost:5000/predict', [ {...}, {...} ])) 