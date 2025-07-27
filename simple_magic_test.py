import sys
import time
import importlib.util

print(f"Python version: {sys.version}")
print(f"Current time: {time.strftime('%H:%M:%S')}")

print("Checking if magic module exists...")
magic_spec = importlib.util.find_spec('magic')
if magic_spec is not None:
    print(f"Magic module found at: {magic_spec.origin}")
else:
    print("Magic module not found in sys.path")

print("Listing installed packages that might be related to magic:")
import subprocess
try:
    result = subprocess.run(['pip', 'list'], capture_output=True, text=True, timeout=5)
    output = result.stdout
    for line in output.splitlines():
        if 'magic' in line.lower():
            print(f"  {line}")
except subprocess.TimeoutExpired:
    print("Pip list command timed out")
except Exception as e:
    print(f"Error running pip list: {e}")

print("\nChecking sys.path:")
for path in sys.path:
    print(f"  {path}")

print(f"\nFinished at: {time.strftime('%H:%M:%S')}")