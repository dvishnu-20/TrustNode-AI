class FrictionEngine:
    def __init__(self):
        self.deposit_amount = 200 # INR

    def evaluate_friction(self, risk_score: float, payment_method: str, rto_probability: float) -> dict:
        """
        Determines what friction to apply based on risk and payment method.
        Matches the logic documented in the README.
        """
        if risk_score <= 39:
            # GREEN ZONE
            return {
                "zone": "GREEN",
                "action": "NORMAL_CHECKOUT",
                "message": "Frictionless checkout",
                "deposit_required": False
            }
            
        elif risk_score <= 74:
            # YELLOW ZONE
            action = "RESTRICT_CARD" if payment_method == "CARD" else "NORMAL_CHECKOUT"
            msg = "For your security, please use UPI." if payment_method == "CARD" else "Proceed with UPI or COD"
            
            return {
                "zone": "YELLOW",
                "action": action,
                "message": msg,
                "deposit_required": False
            }
            
        else:
            # RED ZONE
            if payment_method == "COD" and rto_probability > 0.70:
                return {
                    "zone": "RED",
                    "action": "REQUIRE_COD_DEPOSIT",
                    "message": f"A ₹{self.deposit_amount} booking deposit is required to confirm your COD order.",
                    "deposit_required": True,
                    "deposit_amount": self.deposit_amount
                }
            elif payment_method == "CARD":
                return {
                    "zone": "RED",
                    "action": "RESTRICT_CARD",
                    "message": "Card payments are disabled for this transaction.",
                    "deposit_required": False
                }
            else:
                return {
                    "zone": "RED",
                    "action": "REQUIRE_VERIFICATION",
                    "message": "Strong verification required.",
                    "deposit_required": False
                }

friction_engine = FrictionEngine()
