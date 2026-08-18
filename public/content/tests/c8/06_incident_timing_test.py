r=incident_durations(start_minute=0,detected_minute=4,mitigated_minute=11,recovered_minute=20)
assert r=={"detect":4,"mitigate":7,"recover":9,"total":20}
r2=incident_durations(start_minute=0,detected_minute=.5,mitigated_minute=2.5,recovered_minute=5.)
assert r2["detect"]==.5 and r2["total"]==5.
try:
    incident_durations(start_minute=5,detected_minute=3,mitigated_minute=10,recovered_minute=20)
    raise AssertionError("should raise")
except ValueError: pass
try:
    incident_durations(start_minute=0,detected_minute=4,mitigated_minute=15,recovered_minute=12)
    raise AssertionError("should raise")
except ValueError: pass
fleet=[
    dict(start_minute=0,detected_minute=30,mitigated_minute=35,recovered_minute=40),
    dict(start_minute=0,detected_minute=25,mitigated_minute=32,recovered_minute=36),
    dict(start_minute=0,detected_minute=2,mitigated_minute=6,recovered_minute=9),
]
fr=fleet_report(fleet)
assert fr["count"]==3
assert abs(fr["mean_detect"]-19.)<1e-9 and abs(fr["mean_mitigate"]-16/3)<1e-9
assert fr["invest"]=="detect", \
    "Two of three incidents burned ~30 minutes before anyone noticed. The mean says the money goes to detection — alerting, not faster rollbacks."
fast_detect=[dict(start_minute=0,detected_minute=1,mitigated_minute=20,recovered_minute=25)]
assert fleet_report(fast_detect)["invest"]=="mitigate"
print(f"\u2713 durations={r}")
print("\u2713 ordering violations raise ValueError")
print("\u2713 fleet report names the phase to invest in")
print("\n+1000 XP \u2014 FINAL BOSS. ALL 73 LEVELS COMPLETE. \U0001F3C6")
