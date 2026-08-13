ref={"overall":.82,"tail":.74,"dietary":.91}
assert passes_noninferiority({"overall":.81,"tail":.73,"dietary":.90},ref,.02)
assert not passes_noninferiority({"overall":.83,"tail":.70,"dietary":.92},ref,.02)
assert passes_noninferiority(ref,ref,0.)
assert not passes_noninferiority({"overall":.819,"tail":.74,"dietary":.91},ref,0.)
print("✓ non-inferiority check correct")
print("\n+200 XP — Non-Inferiority Test complete.")
