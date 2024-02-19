# DOS/281 System Calls / Memory Areas

This document outlines the user program facing componenets of DOS/281. It
contains information about executing system calls, and the layout of bank 0.
The interal kernel functions are not documented here.

## System Call Execution

The procedure to execute a system call is as follows:
- Set the current data bank to bank 0
- Place the return address in register C (Will get moved to [D] on syscall execution)
- Place the return page in memory address [D+1]
- Place the syscall # in register B
- Place the syscall argument (if needed) in register A
- Execute `JUMP SYSCALL`

## System Call Tables
| Syscall # | Name    | Arguments | Returns           | Description |
| --------- | ------- | --------- | ----------------- | ----------- |
| 0         | S_EXIT  | None      | None              | Terminates the user program, control is given back to the kernel |
| 1         | S_PUTC  | A = Character | None          | Prints out a single character on the terminal |
| 2         | S_GETC  | None      | A = Character     | Waits for a single character to be inputted in the terminal, and returns it. | 
| 3         | S_STAT  | None      | A = Status        | Returns terminal status, A = 0xFF will be returned if there is a character waiting |
| 4         | S_PUTS  | A = String address \ [ARG_BNK] = String bank | None | Prints out a zero-terminated string |
| 5         | S_INPUT | [ARG_BNK] = Destination of string | None | Inputs a line of text from the terminal. The inputted string can take up the entire bank, is zero-terminated, and always starts at address 0.
| 6         | S_OPEN  | A = String address \ [ARG_BNK] = String bank | A = 0x00 if successful, 0xFF otherwise | Takes a file path as a string, and opens it. The existing file will be closed |
| 7         | S_CLOSE | None      | None              | Closes the current file and flushes all of the buffers |
| 8         | S_READ  | A = Block to read \ [ARG_BNK] = Destination of data | A = 0x00 if successful, 0xFF otherwise | If a file is open, a block will be read into 4 consecutive data banks |
| 9         | S_WRITE | A = Block to write \ [ARG_BNK] = Source of data | A = 0x00 if successful, 0xFF otherwise | If a file is open, a block is written from 4 consecutive data banks |
| 10        | S_FSRCH | A = String address \ [ARG_BNK] = String bank | A = 0x00 if file is found, 0xFF otherwise | Starts a search for a file. See file path format for more information. Current file must be closed |
| 11        | S_NEXT  | None      | A = 0x00 if file is found, 0xFF otherwise | Searches for the next file |
| 12        | S_DELET | None      | A = 0x00 if successful, 0xFF otherwise | Deletes the currently open file. File will be closed. |
| 13        | S_CREAT | A = String address \ [ARG_BNK] = String bank | A = 0x00 if successful, 0xFF otherwise | Creates a new file, if the file already exists it will be replaced. File will then be opened. |
| 14        | S_FREE  | None      | [BD_FREE] = Remaining free blocks | Calculates the remaining free blocks on the block device. Should be run after a file close | 
| 15        | S_EXEC  | None      | None              | Takes the content in the argument buffer and attempts to execute it |

## File I/O Operations

The File I/O operations available in DOS/281 are very minimalistic. Only one
file can be open at a time. The status of a file being open determines what
type of system calls can be executes at a given time.

### File is Closed
- S_OPEN
- S_CLOSE
- S_FSRCH
- S_NEXT
- S_CREAT
- S_FREE

### File is Open
- S_OPEN
- S_CLOSE
- S_READ
- S_WRITE
- S_DELET
- S_CREAT

## File Paths

Certain file operations will accept a file paths. File paths can either point
to a single file, or contain a pattern to match multiple files. The character
`*` can be used to match the rest of the file name, and `?` can be used to
match a single character. A file path must contain a `.` to seperate the name
and the extension.

User areas act as primitive directories on a file system. User areas are
labelled `0` to `9`. File paths can be prefixed with `[0-9]:` to explicitly
define a user area, otherwise the default user area will be used (DFLT_USR).

## File Creation

S_CREAT will only work if the file path is deemed to be acceptable. The path
must be in all uppercase. The only characters that are acceptable are `A-Z`,
`0-9`, `-`, and `_`. Wildcards are not acceptable. 

## Memory Areas

Data bank 0 contains a number of special areas that are shared between the user
program and the kernel. DOS/281 will not load data or instruction into bank 0
during a program load, but after the program executes it can be accessed. 

| Address   | Name     | Description                                                 |
| --------- | -------- | ------------------------------------------------------------|
| 0x00-0x5F | ---      | Unused, free for use in user programs                       |
| 0x60-0x67 | CF_NAME  | Name of the currently open file, or file last searched      |
| 0x68-0x69 | CF_SIZE  | Size of the current file                                    |
| 0x6A      | CF_USR   | User area of the currently open file, or file last searched |
| 0x6B      | DFT_USR  | The default user area 										 |
| 0X6C      | ARG_BNK  | Bank that will be used as an argument by system calls       |
| 0X6E-0X6F | BD_FREE  | Stores the number of unallocated blocks                     |
| 0x70      | MAX_IB   | Maximum instruction bank available to use                   |
| 0x71      | MAX_DB   | Maximum data bank available to use                          |
| 0x72      | CMDL_B   | Bank which contains arguments used to invoke the program    |
| 0x73      | AUTO_B   | Bank which contains information to script execution         |
| 0x78-0x7B | KERNMEM  | Reserved for kernel use                                     |
| 0x7C-0x7F | BIOSMEM  | Reserved for BIOS use                                       |