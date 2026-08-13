ctrl=AdmissionController(max_queue_depth=10,max_p99_ms=200.)
ctrl.update(5,100.); assert ctrl.admit() is True
ctrl.update(10,100.); assert ctrl.admit() is False
ctrl.update(3,250.); assert ctrl.admit() is False
ctrl.update(2,150.); assert ctrl.admit() is True
ctrl.update(9,200.); assert ctrl.admit() is True
print("✓ admission control correct")
print("\n+150 XP — Admission Control complete.")
