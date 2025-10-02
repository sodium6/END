import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

path = Path('Admin Superadmin Access.docx')
with zipfile.ZipFile(path) as zf:
    xml_data = zf.read('word/document.xml')
root = ET.fromstring(xml_data)
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
texts = []
for elem in root.iterfind('.//w:t', ns):
    if elem.text:
        texts.append(elem.text)
combined = '\n'.join(texts)
Path('doc_from_docx_repr.txt').write_text(combined.encode('unicode_escape').decode('ascii'), encoding='utf-8')
