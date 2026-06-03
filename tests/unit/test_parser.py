import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from app.ingestion.parser import parse_file

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), '..', 'fixtures', 'sample.py')

def test_parser():
    chunks = parse_file(FIXTURE_PATH, 'python')

    print(f"\nFound {len(chunks)} chunks:\n")
    for chunk in chunks:
        print(f"  [{chunk.symbol_type}] {chunk.symbol_name}")
        print(f"    file:      {chunk.file_path}")
        print(f"    lines:     {chunk.start_line}-{chunk.end_line}")
        print(f"    parent:    {chunk.parent_class}")
        print(f"    language:  {chunk.language}")
        print(f"    content preview: {chunk.content[:60].strip()!r}")
        print()

    names = [c.symbol_name for c in chunks]
    assert 'TokenManager' in names, "Should find the TokenManager class"
    assert 'verify_token' in names, "Should find verify_token method"
    assert 'revoke_token' in names, "Should find revoke_token method"
    assert 'standalone_function' in names, "Should find standalone_function"

    verify = next(c for c in chunks if c.symbol_name == 'verify_token')
    assert verify.parent_class == 'TokenManager', "verify_token should know its parent class"

    standalone = next(c for c in chunks if c.symbol_name == 'standalone_function')
    assert standalone.parent_class is None, "standalone_function should have no parent class"

    print("All assertions passed.")

if __name__ == '__main__':
    test_parser()
