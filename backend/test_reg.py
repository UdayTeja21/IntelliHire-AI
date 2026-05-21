# import requests

# try:
#     res = requests.post("http://localhost:8000/api/v1/auth/register", json={
#         "email": "test@example.com",
#         "password": "password123",
#         "full_name": "Test User"
#     })
#     print(res.status_code)
#     print(res.text)
# except Exception as e:
#     print("Error:", e)


import requests

try:
    res = requests.post(
        "https://intellihire-ai-5u6e.onrender.com/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )

    print("Status Code:", res.status_code)
    print("Response:", res.json())

except Exception as e:
    print("Error:", e)