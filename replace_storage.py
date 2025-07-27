import os
import shutil
import time

# Log file
log_file = 'storage_replacement.log'

def log_message(message):
    """Log a message with timestamp"""
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

def main():
    """Replace the original storage.py with the fixed version"""
    try:
        # Paths
        original_file = os.path.join('website', 'storage.py')
        fixed_file = os.path.join('website', 'storage_fixed.py')
        backup_file = os.path.join('website', 'storage.py.bak')
        
        # Check if files exist
        if not os.path.exists(fixed_file):
            log_message(f"Error: Fixed file {fixed_file} does not exist")
            return False
            
        if not os.path.exists(original_file):
            log_message(f"Error: Original file {original_file} does not exist")
            return False
        
        # Create backup
        log_message(f"Creating backup of {original_file} to {backup_file}")
        shutil.copy2(original_file, backup_file)
        log_message(f"Backup created successfully")
        
        # Replace the file
        log_message(f"Replacing {original_file} with {fixed_file}")
        shutil.copy2(fixed_file, original_file)
        log_message(f"Replacement completed successfully")
        
        return True
    except Exception as e:
        log_message(f"Error during replacement: {e}")
        return False

if __name__ == '__main__':
    log_message("Starting storage.py replacement process")
    success = main()
    if success:
        log_message("Storage replacement completed successfully")
        print("Storage replacement completed successfully")
        print(f"Original file backed up to website/storage.py.bak")
    else:
        log_message("Storage replacement failed")
        print("Storage replacement failed. Check storage_replacement.log for details")