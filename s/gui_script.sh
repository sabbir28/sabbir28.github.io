#!/bin/bash

# Use Zenity to create a file selection dialog
script_file=$(zenity --file-selection --file-filter="Shell Scripts | *.sh")

# Check if the user canceled the file selection
if [ $? -ne 0 ]; then
    zenity --info --text="Script execution canceled."
    exit 1
fi

# Use Zenity to ask for confirmation before running the selected script
zenity --question --text="Do you want to run the selected script?" --ok-label="Run" --cancel-label="Cancel"

# Check the user's choice
if [ $? -eq 0 ]; then
    # Execute the selected script
    bash "$script_file"
    zenity --info --text="Script execution completed."
else
    zenity --info --text="Script execution canceled."
fi
