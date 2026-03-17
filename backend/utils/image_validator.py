def validate_image_bytes(img_bytes: bytes) -> bool:
    if not img_bytes:
        return False

    # PNG signature
    if img_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return True

    # JPEG / JPG signature
    if img_bytes.startswith(b"\xff\xd8"):
        return True

    return False
