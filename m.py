import random
import time
import sys

def matrix_effect():
    chars = ["0", "1", "█", "▒", "░"]
    width = 80
    while True:
        print("".join(random.choice(chars) for _ in range(width)))
        time.sleep(0.05)

try:
    matrix_effect()
except KeyboardInterrupt:
    sys.exit()
