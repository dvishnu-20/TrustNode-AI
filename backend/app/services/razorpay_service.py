import uuid

def create_payment_link(amount: int, description: str = "COD booking deposit") -> str:
    # Mock generating a payment link since we don't have API keys yet.
    # In reality, this would use razorpay.Client(auth=(key, secret)).payment_link.create(...)
    mock_id = str(uuid.uuid4())[:8]
    return f"https://rzp.io/i/{mock_id}"
