import sys
import os
import threading
import time
import ctypes

print(f"Python version: {sys.version}")

# Function to be called in a separate thread
def import_magic():
    try:
        print("Starting import at: " + time.strftime("%H:%M:%S"))
        import magic
        print("Successfully imported magic")
        print(f"Magic module: {magic.__file__}")
        print("Import completed at: " + time.strftime("%H:%M:%S"))
        return True
    except Exception as e:
        print(f"Error importing magic: {e}")
        print("Exception occurred at: " + time.strftime("%H:%M:%S"))
        return False

# Function to terminate a thread (Windows-compatible)
def terminate_thread(thread):
    if not thread.is_alive():
        return
    
    exc = ctypes.py_object(SystemExit)
    res = ctypes.pythonapi.PyThreadState_SetAsyncExc(
        ctypes.c_long(thread.ident), exc)
    if res == 0:
        print("Thread ID invalid")
    elif res > 1:
        # If more than one thread affected, revert
        ctypes.pythonapi.PyThreadState_SetAsyncExc(thread.ident, None)
        print("Failed to terminate thread")

print("Attempting to import magic...")

# Create and start the thread
import_thread = threading.Thread(target=import_magic)
import_thread.daemon = True
import_thread.start()

# Wait for 5 seconds
import_thread.join(5)

# If thread is still alive after timeout, terminate it
if import_thread.is_alive():
    print("Timeout occurred while importing magic")
    terminate_thread(import_thread)
    print("Thread terminated at: " + time.strftime("%H:%M:%S"))
    sys.exit(1)