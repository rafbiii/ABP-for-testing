import base64

def base64_to_bytes(b64str: str) -> bytes:
    if not b64str:
        return b""
    if "," in b64str:
        b64str = b64str.split(",")[-1]
    return base64.b64decode(b64str)

def bytes_to_base64(img_bytes: bytes) -> str:
    return base64.b64encode(img_bytes).decode("utf-8")
