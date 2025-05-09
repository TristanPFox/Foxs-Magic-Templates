import secrets
import string

# Generate a secure random key of the specified length.
def generate_key(length=32):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

# Example usage:
key = generate_key(32)
print(key)
key = generate_key(32)
print(key)