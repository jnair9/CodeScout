def test_query_status(query_response):
    assert query_response.status_code == 200

def test_query_response_shape(query_response):
    data = query_response.json()
    assert "message" in data
    assert "results" in data
    assert "response" in data

def test_query_results_have_required_fields(query_response):
    data = query_response.json()
    for result in data["results"]:
        assert "file_path" in result
        assert "symbol_name" in result
        assert "start_line" in result
        assert "end_line" in result
        assert "distance" in result

def test_query_response_structure(query_response):
    data = query_response.json()
    assert "answer" in data["response"]
    assert "citations" in data["response"]
    assert isinstance(data["response"]["answer"], str)
    assert isinstance(data["response"]["citations"], list)

def test_query_citations_have_required_fields(query_response):
    data = query_response.json()
    for citation in data["response"]["citations"]:
        assert "citation_number" in citation
        assert "symbol_name" in citation
        assert "file_path" in citation
        assert "start_line" in citation
        assert "end_line" in citation
