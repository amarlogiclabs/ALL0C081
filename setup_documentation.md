# CodeVerse Setup & Run Guide

This document provides instructions on how to use the `setup_and_run.bat` script to automate the setup and execution of the CodeVerse application.

## Overview

The `setup_and_run.bat` script is an all-in-one automation tool that:
1.  **Elevates Privileges**: Automatically restarts as Administrator to perform system configurations.
2.  **Configures Firewall**: Adds Windows Firewall rules to allow traffic on ports:
    *   `5173` (Frontend)
    *   `5000` (Backend)
    *   `8080` (Microservices)
3.  **Checks Prerequisites**: Verifies that required tools (Node.js, Java, Maven, etc.) are installed and in your PATH.
4.  **Starts Services**: Launches the Frontend, Backend, and User Service in separate terminal windows with their respective run commands.

## Prerequisites

Before running the script, ensure you have the following installed on your machine and added to your System PATH:

-   **Node.js** (v18+ recommended) & **npm**
-   **Java JDK** (v17+ recommended)
-   **Maven** (for building the user service)
-   **MinGW** (GCC/G++) (for C/C++ compilation)
-   **Python** (v3.x)

## How to Run

1.  Navigate to the project root directory: `e:\Amarlogiclabsprojects\ALL0C081Project\`
2.  Double-click `setup_and_run.bat`.
    *   *Alternatively*, right-click and select "Run as administrator".
3.  If prompted by User Account Control (UAC), click **Yes** to allow the script to make changes (required for firewall rules).
4.  The script will open a main window showing the initialization progress.
5.  Three new terminal windows will open for:
    *   **CodeVerse Frontend**
    *   **CodeVerse Backend**
    *   **CodeVerse User Service**

## Troubleshooting

### "Not recognized as an internal or external command"
If you see this error for `node`, `npm`, `mvn`, `java`, etc., it means the tool is not in your system's PATH environment variable.
*   **Fix**: Reinstall the missing tool and ensure "Add to PATH" is selected during installation, or manually add the bin directory to your System PATH variables.

### Services start but checking for updates...
This is normal. `npm` and `mvn` downloads can take some time on the first run. Wait for the logs to show "Server running" or similar success messages.

### Ports already in use
If a service fails to start because the port is in use:
1.  Close any existing terminal windows running CodeVerse.
2.  Run `setup_and_run.bat` again.

---
**Amarlogic Labs Projects**
