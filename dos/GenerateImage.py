#!/bin/python3
#
# GenerateImage.py
#
# Uses a master boot record and file system characteristics
# to generate an empty file system image for DOS/281
#
# Usage: GenerateImage.py mbr.sav [# blocks total] [# blocks for records]
# as a rule, each
import sys

def main():
    print("i281 DOS/281 FS Generate V0.1")
    print("SD Group 24-14")
    print("Updated Jan 16, 2024")
    
    # Read in the master boot record
    mbr_f = open(sys.argv[1], mode="rb")
    mbr = mbr_f.read()
    
    # Create image file
    image = open("dos281.img", mode="wb")
    
    # Output MBR to image file
    for o in range(512):
        image.write((mbr[o]).to_bytes(1, byteorder='big'));

    # Output the rest of the filesystem as empty
    for o in range((512 * 256 * 256) - 512):
        image.write((0).to_bytes(1, byteorder='big'));

    # Close all files
    mbr_f.close()
    image.close()

if __name__ == "__main__":
    main()