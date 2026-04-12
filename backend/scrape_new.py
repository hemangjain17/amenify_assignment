from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-0f2062e22c9a4733b4c35a6a151b82be")

data = app.scrape(
    "www.amenify.com/",
    only_main_content=False,
    max_age=172800000,
    parsers=["pdf"],
    formats=[
        {
            "type": "json",
            "schema": {
                "type": "object",
                "required": [],
                "properties": {
                    "company_name": {
                        "type": "string"
                    },
                    "company_description": {
                        "type": "string"
                    }
                }
            }
        }
    ]
)

print(data)