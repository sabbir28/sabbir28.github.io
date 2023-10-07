#!/bin/bash

# Use Zenity to create a password entry dialog for the username
username=$(zenity --entry --title="Login" --text="Enter Username:" --entry-text "admin")

# Check if the user canceled the username entry
if [ $? -ne 0 ]; then
    zenity --info --text="Login canceled."
    exit 1
fi

# Use Zenity to create a password entry dialog for the password
password=$(zenity --password --title="Login" --text="Enter Password:")

# Check if the user canceled the password entry
if [ $? -ne 0 ]; then
    zenity --info --text="Login canceled."
    exit 1
fi

# Check if the username and password are not empty
if [ -z "$username" ] || [ -z "$password" ]; then
    zenity --error --text="Username and password must not be empty."
    # exit 1
fi

# Check if the username is "admin" and the password is "root"
if [ "$username" == "admin" ] && [ "$password" == "root" ]; then
    zenity --info --text="Login successful."
    xdg-open "https://sabbir28.github.io/"
else
    zenity --error --text="Login failed. Invalid username or password."
fi
