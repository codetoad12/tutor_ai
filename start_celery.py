#!/usr/bin/env python
"""
Script to start Celery worker and beat processes.
This is useful for development and can be adapted for production.
"""

import os
import sys
import subprocess
import signal
import time
from multiprocessing import Process

def start_worker():
    """Start Celery worker process"""
    cmd = [
        'celery', '-A', 'TUTOR_AI', 'worker',
        '--loglevel=info',
        '--concurrency=2',
        '--max-tasks-per-child=1000'
    ]
    return subprocess.Popen(cmd)

def start_beat():
    """Start Celery beat process"""
    cmd = [
        'celery', '-A', 'TUTOR_AI', 'beat',
        '--loglevel=info',
        '--scheduler', 'django_celery_beat.schedulers:DatabaseScheduler'
    ]
    return subprocess.Popen(cmd)

def start_flower():
    """Start Flower monitoring (optional)"""
    cmd = [
        'celery', '-A', 'TUTOR_AI', 'flower',
        '--port=5555'
    ]
    return subprocess.Popen(cmd)

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print('\nShutting down Celery processes...')
    for process in processes:
        if process.poll() is None:  # Process is still running
            process.terminate()
            process.wait()
    sys.exit(0)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Start Celery processes')
    parser.add_argument('--worker-only', action='store_true', help='Start only worker process')
    parser.add_argument('--beat-only', action='store_true', help='Start only beat process')
    parser.add_argument('--with-flower', action='store_true', help='Start Flower monitoring')
    
    args = parser.parse_args()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    processes = []
    
    try:
        if args.worker_only:
            print("Starting Celery worker...")
            worker = start_worker()
            processes.append(worker)
        elif args.beat_only:
            print("Starting Celery beat...")
            beat = start_beat()
            processes.append(beat)
        else:
            print("Starting Celery worker and beat...")
            worker = start_worker()
            time.sleep(2)  # Give worker time to start
            beat = start_beat()
            processes.extend([worker, beat])
            
            if args.with_flower:
                print("Starting Flower monitoring...")
                time.sleep(2)
                flower = start_flower()
                processes.append(flower)
                print("Flower will be available at http://localhost:5555")
        
        print("Celery processes started. Press Ctrl+C to stop.")
        
        # Wait for processes
        while True:
            time.sleep(1)
            for process in processes:
                if process.poll() is not None:
                    print(f"Process {process.pid} has terminated")
                    processes.remove(process)
            
            if not processes:
                break
                
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None) 