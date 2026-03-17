def test_register_success(client):
    response = client.post("/auth/registration", json={
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    })

    assert response.status_code == 200
    assert response.json()["confirmation"] == "register successful"
    
def test_register_invalid_username(client):
    response = client.post("/auth/registration", json={
        "username": "raf",  # terlalu pendek
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    })

    assert response.status_code == 200
    assert "username length must be" in response.json()["confirmation"]
    
    
def test_register_invalid_password(client):
    response = client.post("/auth/registration", json={
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "pass"  # terlalu lemah
    })

    assert response.status_code == 200
    assert "password length must be" in response.json()["confirmation"]
    
def test_register_duplicate_email(client):
    data = {
        "username": "rafiq123",
        "fullname": "Rafiq Labib",
        "email": "rafiq@mail.com",
        "password": "Password1"
    }

    # register pertama
    client.post("/auth/registration", json=data)

    # register kedua (duplicate)
    response = client.post("/auth/registration", json=data)

    assert response.status_code == 200
    assert response.json()["confirmation"] == "email already registered"