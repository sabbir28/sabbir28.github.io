# streamlit_app.py

import streamlit as st
import requests

def get_web_page_content(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        return f"Error fetching content: {e}"

def main():
    st.title("Web Page Viewer")

    # Input for the URL
    url = st.text_input("Enter URL:")
    
    # Button to load the web page
    load_button = st.button("Load Web Page")

    # If the button is clicked, display the web page content
    if load_button:
        if url:
            st.subheader("Web Page Content:")
            page_content = get_web_page_content(url)
            st.markdown(page_content, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
