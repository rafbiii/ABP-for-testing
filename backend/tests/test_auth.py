def test_register_success(client):
    print("\n[TEST CASE] Register - Data Valid")

    payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    print("[INPUT]")
    for k, v in payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(f"    response: {response.json()}")

    assert response.status_code == 200
    assert response.json()["confirmation"] == "register successful"

    print("[RESULT]")
    print("    User berhasil register")
    
def test_register_invalid_username(client):
    print("\n[TEST CASE] Register - Username Tidak Valid")

    payload = {
        "username": "raf",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    print("[INPUT]")
    for k, v in payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(f"    response: {response.json()}")

    assert "username length must be" in response.json()["confirmation"]

    print("[RESULT]")
    print("    Sistem menolak username tidak valid")
    
    
def test_register_duplicate_email(client):
    print("\n[TEST CASE] Register - Email Duplicate")

    payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    print("[INPUT]")
    for k, v in payload.items():
        print(f"    {k}: {v}")

    client.post("/auth/registration", json=payload)
    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(f"    response: {response.json()}")

    assert response.json()["confirmation"] == "email already registered"

    print("[RESULT]")
    print("    Sistem menolak email duplicate")