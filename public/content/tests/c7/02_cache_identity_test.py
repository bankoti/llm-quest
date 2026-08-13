cache=VersionedCache("v2","idx-3")
e=CacheEntry("q:protein","results...","v2","idx-3")
cache.put(e)
assert cache.get("q:protein") is not None
try:
    cache.put(CacheEntry("q:milk","results...","v1","idx-3"))
    raise AssertionError("should raise")
except ValueError: pass
cache2=VersionedCache("v3","idx-3"); cache2._store=dict(cache._store)
assert cache2.get("q:protein") is None,"stale entry from old version"
print("✓ version mismatch raises ValueError")
print("✓ stale entries not returned")
print("\n+150 XP — Cache Identity complete.")
