import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

path = Path('Admin Superadmin Access.docx')
with zipfile.ZipFile(path) as zf:
    xml_data = zf.read('word/document.xml')

root = ET.fromstring(xml_data)
# Word uses namespace; we need to handle
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
texts = []
for elem in root.iterfind('.//w:t', ns):
    texts.append(elem.text)
text = ''.join(texts)
Path('doc_from_docx.txt').write_text(text, encoding='utf-8')
