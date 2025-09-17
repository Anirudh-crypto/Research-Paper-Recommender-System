import requests
import xml.etree.ElementTree as ET

ARXIV_API_URL = "http://export.arxiv.org/api/query"


def fetch_papers(query: str, max_results: int = 10):
    """
    Fetch papers from arXiv API based on a search query.

    Args:
        query (str): Search term (e.g. "Computer Vision")
        max_results (int): Number of papers to fetch

    Returns:
        List[dict]: Parsed papers with metadata
    """
    params = {
        "search_query": query,
        "start": 0,
        "max_results": max_results,
    }

    response = requests.get(ARXIV_API_URL, params=params)
    if response.status_code != 200:
        raise Exception(f"Error fetching from arXiv: {response.status_code}")

    root = ET.fromstring(response.content)

    papers = []
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        arxiv_id = entry.find("{http://www.w3.org/2005/Atom}id").text.split("/")[-1]
        title = entry.find("{http://www.w3.org/2005/Atom}title").text.strip()
        abstract = entry.find("{http://www.w3.org/2005/Atom}summary").text.strip()
        authors = ", ".join(
            [author.find("{http://www.w3.org/2005/Atom}name").text
             for author in entry.findall("{http://www.w3.org/2005/Atom}author")]
        )
        published = entry.find("{http://www.w3.org/2005/Atom}published").text
        year = int(published.split("-")[0])
        url = entry.find("{http://www.w3.org/2005/Atom}id").text

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "abstract": abstract,
            "authors": authors,
            "publication_year": year,
            "url": url
        })

    return papers
