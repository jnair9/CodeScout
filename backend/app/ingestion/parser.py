from ..models.schema import CodeChunk
import tree_sitter_python as tspython
import tree_sitter_java as tsjava
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tsts
import tree_sitter_go as tsgo
import tree_sitter_rust as tsrust
import tree_sitter_ruby as tsruby
import tree_sitter_kotlin as tskotlin
from tree_sitter import Language, Parser

# Node types to extract as symbols, and which types define a parent class scope
LANGUAGE_CONFIG = {
    'python': {
        'symbol_types': {'function_definition', 'class_definition'},
        'class_types':  {'class_definition'},
    },
    'java': {
        'symbol_types': {'method_declaration', 'class_declaration', 'interface_declaration', 'constructor_declaration'},
        'class_types':  {'class_declaration', 'interface_declaration'},
    },
    'javascript': {
        'symbol_types': {'function_declaration', 'class_declaration', 'method_definition'},
        'class_types':  {'class_declaration'},
    },
    'typescript': {
        'symbol_types': {'function_declaration', 'class_declaration', 'method_definition', 'interface_declaration'},
        'class_types':  {'class_declaration', 'interface_declaration'},
    },
    'tsx': {
        'symbol_types': {'function_declaration', 'class_declaration', 'method_definition', 'interface_declaration'},
        'class_types':  {'class_declaration', 'interface_declaration'},
    },
    'go': {
        'symbol_types': {'function_declaration', 'method_declaration'},
        'class_types':  set(),
    },
    'rust': {
        'symbol_types': {'function_item', 'struct_item', 'enum_item', 'trait_item'},
        'class_types':  {'struct_item', 'trait_item'},
    },
    'ruby': {
        'symbol_types': {'method', 'singleton_method', 'class', 'module'},
        'class_types':  {'class', 'module'},
    },
    'kotlin': {
        'symbol_types': {'function_declaration', 'class_declaration', 'object_declaration'},
        'class_types':  {'class_declaration', 'object_declaration'},
    },
}

def _build_language(language: str) -> Language:
    if language == 'python':
        return Language(tspython.language())
    elif language == 'java':
        return Language(tsjava.language())
    elif language == 'javascript':
        return Language(tsjavascript.language())
    elif language == 'typescript':
        return Language(tsts.language_typescript())
    elif language == 'tsx':
        # TSX grammar is a superset of TS — use it for .tsx files
        return Language(tsts.language_tsx())
    elif language == 'go':
        return Language(tsgo.language())
    elif language == 'rust':
        return Language(tsrust.language())
    elif language == 'ruby':
        return Language(tsruby.language())
    elif language == 'kotlin':
        return Language(tskotlin.language())
    else:
        raise ValueError(f'{language} is not supported')

def parse_file(file_path: str, language: str, repo_url: str, stored_path: str = None) -> list[CodeChunk]:
    #Set up correct language and parser
    if not file_path or not language:
        raise ValueError("Filepath and language is required")
    config = LANGUAGE_CONFIG.get(language)
    if not config:
        raise ValueError(f'{language} is not supported')
    with open(file_path, 'rb') as f:
        content = f.read()
    parser = Parser(_build_language(language))
    tree = parser.parse(content)
    chunks = []
    traverse_dfs(tree.root_node, None, chunks, content, stored_path or file_path, language, repo_url, config)
    return chunks

def traverse_dfs(node, parent_class, chunks, content, file_path, language, repo_url, config):
    symbol_types = config['symbol_types']
    class_types  = config['class_types']

    if node.type in symbol_types:
        name_node = node.child_by_field_name("name")
        if name_node:
            new_chunk = CodeChunk(
                repo_url=repo_url,
                file_path=file_path,
                parent_class=parent_class,
                symbol_name=name_node.text.decode("utf-8"),
                symbol_type=node.type,
                content=content[node.start_byte : node.end_byte].decode("utf-8"),
                start_line=node.start_point[0] + 1,
                end_line=node.end_point[0] + 1,
                language=language
            )
            chunks.append(new_chunk)

    # Update parent scope when entering a class/interface
    new_parent = parent_class
    if node.type in class_types:
        name_node = node.child_by_field_name("name")
        if name_node:
            new_parent = name_node.text.decode("utf-8")

    # We need to make other if - else statements for other languages later
    for child in node.children:
        traverse_dfs(child, new_parent, chunks, content, file_path, language, repo_url, config)
    return chunks
