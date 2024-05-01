#!/bin/python3
#
# YMConvert.py
#
# Converts a YM5 datablock file into YM5 interleaved
# There is no digidrum support in this
#
# Usage: AddFile.py Input.ym Output.ym
import sys
import os
import math

def main():
    print("YM Datablock to Interleaved Converter")
    
    # Read in the original ym file
    input_f = open(sys.argv[1], mode="rb")
    input = list(input_f.read())
    input_f.close()
    
    # Check header
    if input[0:4] != [89, 77, 53, 33]:
        print("Not a YM5 file!")
        exit(1)
        
    # Check attributes
    if input[19] & 0x01 == 0:
        print("File is already interleaved")
        
    # Reset attribute bit
    input[19] &= 0xFE
    
    # Get number of VBL
    num_vbl = (input[12] << 24) + (input[12+1] << 16) + (input[12+2] << 8) + input[12+3]
    print("VBL count in file: " + str(num_vbl))
    
    # Find end of header
    data_start = 34
    c = 3
    while c > 0:
        if input[data_start] == 0:
            c -= 1
        data_start += 1
    
    # Start outputting the newly created YM file
    output = open(sys.argv[2], mode="wb")
    output.write(bytes(input[0:data_start]))
    
    # Output the new interleaved record
    for i in range(num_vbl):
        for o in range(16):
            output.write(bytes([input[data_start + (o * num_vbl) + i]]))
    
    # Terminate and complete
    output.write("End!".encode())
    print("Done")
    output.close()
        
    
if __name__ == "__main__":
    main()