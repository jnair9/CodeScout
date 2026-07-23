import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from app.ingestion.parser import parse_file

FIXTURES = os.path.join(os.path.dirname(__file__), '..', 'fixtures')
REPO = 'https://github.com/jnair9/CodeScout'

def fixture(name):
    return os.path.join(FIXTURES, name)


# ── Python ────────────────────────────────────────────────────────────────────

def test_python_parser():
    chunks = parse_file(fixture('sample.py'), 'python', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'verify_token' in names
    assert 'revoke_token' in names
    assert 'standalone_function' in names

    verify = next(c for c in chunks if c.symbol_name == 'verify_token')
    assert verify.parent_class == 'TokenManager'

    standalone = next(c for c in chunks if c.symbol_name == 'standalone_function')
    assert standalone.parent_class is None
    assert standalone.language == 'python'


# ── Java ──────────────────────────────────────────────────────────────────────

def test_java_parser():
    chunks = parse_file(fixture('sample.java'), 'java', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'verifyToken' in names
    assert 'revokeToken' in names
    assert 'HelperClass' in names
    assert 'standaloneHelper' in names

    verify = next(c for c in chunks if c.symbol_name == 'verifyToken')
    assert verify.parent_class == 'TokenManager'
    assert verify.language == 'java'

    helper = next(c for c in chunks if c.symbol_name == 'standaloneHelper')
    assert helper.parent_class == 'HelperClass'


# ── JavaScript ────────────────────────────────────────────────────────────────

def test_javascript_parser():
    chunks = parse_file(fixture('sample.js'), 'javascript', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'verifyToken' in names
    assert 'revokeToken' in names
    assert 'standaloneFunction' in names

    verify = next(c for c in chunks if c.symbol_name == 'verifyToken')
    assert verify.parent_class == 'TokenManager'
    assert verify.language == 'javascript'

    standalone = next(c for c in chunks if c.symbol_name == 'standaloneFunction')
    assert standalone.parent_class is None


# ── TypeScript ────────────────────────────────────────────────────────────────

def test_typescript_parser():
    chunks = parse_file(fixture('sample.ts'), 'typescript', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'AuthService' in names
    assert 'TokenManager' in names
    assert 'verifyToken' in names
    assert 'revokeToken' in names
    assert 'standaloneFunction' in names

    verify = next(c for c in chunks if c.symbol_name == 'verifyToken')
    assert verify.parent_class == 'TokenManager'
    assert verify.language == 'typescript'

    standalone = next(c for c in chunks if c.symbol_name == 'standaloneFunction')
    assert standalone.parent_class is None


# ── Go ────────────────────────────────────────────────────────────────────────

def test_go_parser():
    chunks = parse_file(fixture('sample.go'), 'go', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'StandaloneFunction' in names
    assert 'VerifyToken' in names
    assert 'RevokeToken' in names

    standalone = next(c for c in chunks if c.symbol_name == 'StandaloneFunction')
    assert standalone.language == 'go'

    # Go has no class hierarchy — methods have no parent_class in our model
    verify = next(c for c in chunks if c.symbol_name == 'VerifyToken')
    assert verify.symbol_type == 'method_declaration'


# ── Rust ──────────────────────────────────────────────────────────────────────

def test_rust_parser():
    chunks = parse_file(fixture('sample.rs'), 'rust', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'AuthService' in names
    assert 'Status' in names
    assert 'standalone_function' in names

    fn_chunk = next(c for c in chunks if c.symbol_name == 'standalone_function')
    assert fn_chunk.symbol_type == 'function_item'
    assert fn_chunk.language == 'rust'

    struct_chunk = next(c for c in chunks if c.symbol_name == 'TokenManager')
    assert struct_chunk.symbol_type == 'struct_item'


# ── Ruby ──────────────────────────────────────────────────────────────────────

def test_ruby_parser():
    chunks = parse_file(fixture('sample.rb'), 'ruby', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'verify_token' in names
    assert 'revoke_token' in names
    assert 'AuthHelper' in names
    assert 'standalone_function' in names

    verify = next(c for c in chunks if c.symbol_name == 'verify_token')
    assert verify.parent_class == 'TokenManager'
    assert verify.language == 'ruby'

    standalone = next(c for c in chunks if c.symbol_name == 'standalone_function')
    assert standalone.parent_class is None


# ── Kotlin ────────────────────────────────────────────────────────────────────

def test_kotlin_parser():
    chunks = parse_file(fixture('sample.kt'), 'kotlin', REPO)
    names = [c.symbol_name for c in chunks]

    assert 'TokenManager' in names
    assert 'verifyToken' in names
    assert 'revokeToken' in names
    assert 'AuthSingleton' in names
    assert 'standaloneFunction' in names

    verify = next(c for c in chunks if c.symbol_name == 'verifyToken')
    assert verify.parent_class == 'TokenManager'
    assert verify.language == 'kotlin'

    standalone = next(c for c in chunks if c.symbol_name == 'standaloneFunction')
    assert standalone.parent_class is None
