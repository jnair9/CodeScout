def normalize_url(url):
    if url.endswith(".git"):
        url = url.removesuffix(".git")
    return url