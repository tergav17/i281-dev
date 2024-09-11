#!/bin/python3
#
# GenerateCFTestPattern.py
#
# Generates a flash image for the compact flash burn-in program

import sys

def main():
    print("i281 Burn-in Test Image Generator")
    print("SD Group 24-14")
    print("Updated July 4, 2024")
    
    # Create output data files
    output_img = open("BURNIN.IMG", mode="w")

    # Start outputting blocks
    for x in range(256):
        for y in range(256):
            i = y
            for z in range(512):
                output_img.write(chr(i & 0xFF))
                i += x
    
    # Close file
    output_img.close()

if __name__ == "__main__":
    main()