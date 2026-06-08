def generate_nudge(adherence_rate):
    """
    Generates a personalized nudge based on medication adherence rate.
    Uses concepts from Prospect Theory: Loss Aversion vs Social Proof.
    """
    adherence = float(adherence_rate)
    
    if adherence < 0.50:
        # Loss Aversion Nudge (Loss Framing)
        # Note: Humans weight losses ~2.5x more than gains
        impact_multiplier = 2.5
        nudge = {
            "type": "Loss Aversion",
            "message": "You are losing the cardiovascular protection you built up! Missing doses increases risk by 25%.",
            "psychological_impact": impact_multiplier,
            "cta": "Take your medication now to stop the loss."
        }
    else:
        # Social Proof Nudge (Gain/Normative Framing)
        nudge = {
            "type": "Social Proof",
            "message": "80% of patients with your profile stayed active and adherent today! You're in the top tier.",
            "psychological_impact": 1.0,
            "cta": "Keep up the great work!"
        }
    
    return nudge

if __name__ == "__main__":
    print("Testing Nudging for 30% adherence:")
    print(generate_nudge(0.3))
    print("\nTesting Nudging for 85% adherence:")
    print(generate_nudge(0.85))
