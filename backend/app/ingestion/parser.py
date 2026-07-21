from ..models.schema import CodeChunk
import tree_sitter_python as tspython
from tree_sitter import Language, Parser

def parse_file(file_path: str, language: str, repo_url: str, stored_path: str = None) -> list[CodeChunk]:
    #Set up correct language and parser
    if not file_path or not language:
        raise ValueError("Filepath and language is required")
    if language == 'python':
        PY_LANGUAGE = Language(tspython.language())
    # We need to make other if - else statements for other languages later
    else:
        raise ValueError(f'{language} is not supported')
    with open(file_path, 'rb') as f:
        content = f.read()
    parser = Parser(PY_LANGUAGE)
    tree = parser.parse(content)
    chunks = []
    traverse_dfs(tree.root_node, None, chunks, content, stored_path or file_path, language, repo_url)
    return chunks

def traverse_dfs(node, parent_class, chunks, content, file_path, language, repo_url):
    if node.type == "function_definition" or node.type == "class_definition":
        new_chunk = CodeChunk(
            repo_url=repo_url,
            file_path=file_path,
            parent_class=parent_class,
            symbol_name=node.child_by_field_name("name").text.decode("utf-8"),
            symbol_type=node.type,
            content=content[node.start_byte : node.end_byte].decode("utf-8"),
            start_line=node.start_point[0] + 1,
            end_line=node.end_point[0] + 1,
            language=language
        )
        chunks.append(new_chunk)
    new_parent = node.child_by_field_name("name").text.decode("utf-8") if node.type == "class_definition" else parent_class
    for child in node.children:
        traverse_dfs(child, new_parent, chunks, content, file_path, language, repo_url)
    return chunks
         

