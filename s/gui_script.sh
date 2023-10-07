#!/bin/bash

# Use Zenity to prompt the user to select a directory to start the scan
selected_directory=$(zenity --file-selection --directory --title="Select a Directory to Scan")

# Check if the user canceled the directory selection
if [ $? -ne 0 ]; then
    zenity --info --text="Scan canceled."
    exit 1
fi

# Use find to scan all files and directories starting from the selected directory
scan_result=$(find "$selected_directory")

# Use Zenity to display the scan result in a text box
zenity --text-info --title="File Scanner" --width=800 --height=600 --text="$scan_result"
