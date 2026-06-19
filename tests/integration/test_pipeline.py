def test_full_pipeline(query_response):
    assert query_response.status_code == 200
    data = query_response.json()
    assert len(data["results"]) > 0
    assert data["response"]["answer"] is not None
    assert len(data["response"]["citations"]) > 0

def test_pipeline_file_paths_are_relative(query_response):
    data = query_response.json()
    for result in data["results"]:
        assert not result["file_path"].startswith("/var"), (
            f"file_path should be relative, got: {result['file_path']}"
        )

def test_pipeline_citations_match_results(query_response):
    data = query_response.json()
    citation_numbers = [c["citation_number"] for c in data["response"]["citations"]]
    assert citation_numbers == sorted(citation_numbers)
