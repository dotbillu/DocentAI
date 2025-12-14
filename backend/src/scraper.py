import time
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import trafilatura

def scrape_website(url):
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        return None

    clean_text = trafilatura.extract(
        downloaded,
        output_format="markdown",
        include_links=True,
        include_images=False,
        include_tables=True
    )

    if not clean_text:
        return None

    return {
        "url": url,
        "content": clean_text
    }

def crawl_site(start_url, max_depth=1):
    parsed_root = urlparse(start_url)
    root_domain = parsed_root.netloc
    
    visited = set()
    results = []

    def _crawl(url, depth):
        if depth > max_depth or url in visited:
            return
        
        if urlparse(url).netloc != root_domain:
            return

        visited.add(url)
        print(f"Crawling: {url}")
        
        data = scrape_website(url)
        if data:
            results.append(data)
            
            try:
                response = requests.get(url, timeout=10)
                soup = BeautifulSoup(response.text, "lxml")
                for a in soup.find_all("a", href=True):
                    href = a.get("href")
                    if isinstance(href, str) and not href.startswith("#") and "javascript" not in href:
                        absolute_link = urljoin(url, href)
                        _crawl(absolute_link, depth + 1)
            except Exception:
                pass

    _crawl(start_url, 0)
    return results
