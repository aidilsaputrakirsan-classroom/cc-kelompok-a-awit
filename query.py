import urllib.request
import urllib.parse
query = '[out:json];way["name"="Kebun Kelapa Sawit PT. Bio"];out center;'
url = 'https://overpass-api.de/api/interpreter?data=' + urllib.parse.quote(query)
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
print(urllib.request.urlopen(req).read().decode('utf-8'))
