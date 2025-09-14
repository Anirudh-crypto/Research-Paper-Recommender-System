# Backend 

This directory contains the backend code for the research paper recommender system. It includes the implementation of the recommendation algorithms, data processing, and API endpoints to serve recommendations to the frontend.

## Getting Started

To get started with the backend, follow these steps:
1. Navigate to the `app` directory:
   ```bash
   cd app
   ```
2. Install the required dependencies:
   ```bash
    pip install -r requirements.txt
    ```
3. Set up the environment variables:
    - Create a `.env` file in the `root` directory.

4. Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```
5. The backend server will be running at `http://localhost:8000`.