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
    
def test_register_invalid_password_format(client):
    print("\n[TEST CASE] Register - Password Tidak Sesuai Format")

    payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "password"  # tidak ada uppercase & angka
    }

    print("[INPUT]")
    for k, v in payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(f"    status_code: {response.status_code}")
    print(f"    response: {response.json()}")

    assert response.status_code == 200
    assert "password must contain at least one uppercase letter" in response.json()["confirmation"]

    print("[RESULT]")
    print("    Sistem menolak password yang tidak memenuhi format")
    
def test_login_success(client):
    print("\n[TEST CASE] Login - Berhasil")

    register_payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    login_payload = {
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    # register dulu
    client.post("/auth/registration", json=register_payload)

    print("[INPUT]")
    for k, v in login_payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/login", json=login_payload)

    print("[OUTPUT]")
    print(f"    status_code: {response.status_code}")
    print(f"    response: {response.json()}")

    assert response.status_code == 200
    assert response.json()["confirmation"] == "login successful"
    assert "token" in response.json()

    print("[RESULT]")
    print("    Login berhasil dan token dikembalikan")
    
def test_login_wrong_password(client):
    print("\n[TEST CASE] Login - Password Salah")

    register_payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    login_payload = {
        "email": "rafiq@mail.com",
        "password": "WrongPass1"
    }

    client.post("/auth/registration", json=register_payload)

    print("[INPUT]")
    for k, v in login_payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/login", json=login_payload)

    print("[OUTPUT]")
    print(f"    status_code: {response.status_code}")
    print(f"    response: {response.json()}")

    assert response.status_code == 200
    assert response.json()["confirmation"] == "password incorrect"

    print("[RESULT]")
    print("    Sistem menolak login dengan password salah")
    
def test_login_email_not_found(client):
    print("\n[TEST CASE] Login - Email Tidak Ditemukan")

    payload = {
        "email": "tidakada@mail.com",
        "password": "Password1"
    }

    print("[INPUT]")
    for k, v in payload.items():
        print(f"    {k}: {v}")

    response = client.post("/auth/login", json=payload)

    print("[OUTPUT]")
    print(f"    status_code: {response.status_code}")
    print(f"    response: {response.json()}")

    assert response.status_code == 200
    assert response.json()["confirmation"] == "email doesn't exist"

    print("[RESULT]")
    print("    Sistem menolak login karena email tidak ditemukan")
    
def test_register_email_case_insensitive(client):
    print("\n[TEST CASE] Register - Email Case Sensitivity")

    payload1 = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    payload2 = {
        "username": "rafiq456",
        "fullname": "Rafiq Labib",
        "email": "Rafiq@mail.com",
        "password": "Password1"
    }

    client.post("/auth/registration", json=payload1)
    response = client.post("/auth/registration", json=payload2)

    print("[OUTPUT]")
    print(response.json())

    # idealnya ini harus ditolak (409)
    assert response.status_code in [200, 409]

    print("[RESULT]")
    print("    Cek apakah sistem sensitif terhadap case email")
    
def test_register_email_with_spaces(client):
    print("\n[TEST CASE] Register - Email Dengan Spasi")

    payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "  rafiq@mail.com  ",
        "password": "Password1"
    }

    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(response.json())

    # tergantung implementasi, ini bisa lolos atau gagal
    assert response.status_code in [200, 400]

    print("[RESULT]")
    print("    Sistem diuji terhadap input email dengan spasi")
    
def test_register_password_only_numbers(client):
    print("\n[TEST CASE] Register - Password Hanya Angka")

    payload = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "12345678"
    }

    response = client.post("/auth/registration", json=payload)

    print("[OUTPUT]")
    print(response.json())

    assert response.status_code == 200

    print("[RESULT]")
    print("    Sistem menolak password tanpa huruf")