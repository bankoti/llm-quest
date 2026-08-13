assert expected_calibration_error([0.,1.],[0,1],bins=2)==0.
assert expected_calibration_error([.9,.9],[0,0],bins=2)==.9
ece=expected_calibration_error([.7,.7,.3,.3],[1,0,1,0],bins=2)
assert 0.<=ece<=1.
assert abs(expected_calibration_error([.8],[0],bins=10)-.8)<1e-9
print("✓ calibration correct")
print("\n+150 XP — Calibration complete.")
