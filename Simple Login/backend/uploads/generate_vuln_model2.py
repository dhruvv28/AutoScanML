import torch
import torch.nn as nn
import os

class VulnModel(nn.Module):
    """
    This is a vulnerable model.
    password = "supersecret123"
    api_key = "FAKE-API-KEY-123456"
    # debug: True
    """
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(10, 10)
        self.fc2 = nn.Linear(10, 2)
        # Suspicious attribute
        self.secret = "token=hardcodedtoken"
        self.debug_mode = True
    def forward(self, x):
        # No input validation
        if torch.any(x == 0):
            # Dynamic vuln: division by zero
            x = x / x
        return self.fc2(torch.relu(self.fc1(x)))

# Create model instance
model = VulnModel()

# Add more suspicious metadata
model.metadata = {
    'author': 'hacker',
    'note': 'eval(debug=True)',
    'private_key': 'PRIVATEKEY-XYZ',
}

# Save the model to the uploads directory
save_path = os.path.join(os.path.dirname(__file__), 'vuln_model2.pt')
torch.save(model, save_path)
print(f"Vulnerable model saved to {save_path}") 