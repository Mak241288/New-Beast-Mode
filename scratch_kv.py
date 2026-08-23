import urllib.request
import json
import random
import string

# Test kvdb.io or similar free KV with 2 min TTL
bucket = "BM_" + ''.join(random.choices(string.ascii_letters + string.digits, k=12))
key = "TEST10CHAR"
data = json.dumps({"plan": "Chest Day", "exp": 120}).encode()

put_url = f"https://kvdb.io/{bucket}/{key}?ttl=120"
print("PUT URL:", put_url)

try:
    req = urllib.request.Request(put_url, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        print("PUT status:", resp.status, resp.read().decode())
        
    get_url = f"https://kvdb.io/{bucket}/{key}"
    req2 = urllib.request.Request(get_url)
    with urllib.request.urlopen(req2) as resp2:
        print("GET status:", resp2.status, resp2.read().decode())
except Exception as e:
    print("KVDB error:", e)
