from rank_bm25 import BM25Okapi


def get_bm_rank(query, corpus):
    if not corpus:
        return
    tokenized_corpus = [doc.content.lower().split() for doc in corpus]
    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = query.lower().split()
    top_n_res = bm25.get_top_n(tokenized_query, corpus, n=5)
    return top_n_res
