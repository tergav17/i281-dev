#!/bin/python3
#
# SavToAuto.py
#
# Turns a .SAV file into a series of keystrokes that can
# be entered into the monitor

import sys

def main():
    print("i281 SAV To Auto V0.1")
    print("SD Group 24-14")
    print("Updated Feb 11, 2024")
    
    # Read in the data file
    input = open(sys.argv[1], mode="rb")
    data = input.read()
    
    # Create output data files
    output_txt = open(sys.argv[2], mode="w")

    # Start outputting blocks
    i = 0;
    while i < len(data):
        
        # Output block header
        output_txt.write("%02XB\n"  % data[i + 2])
        
        # Output data section
        for o in range(128):
            output_txt.write("%02X/%02X\n"  % (o, data[i+128+o]))
            
        # Output text section
        for o in range(128):
            output_txt.write("%02X-%02X%02X\n"  % (o, data[i+256+(o*2)], data[i+256+(o*2)+1]))
        
        i = i + 512
    
    # Close all files
    input.close()
    output_txt.close()

if __name__ == "__main__":
    main()