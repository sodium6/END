from pathlib import Path
text = Path('doc_from_docx_repr.txt').read_text(encoding='utf-8')
Path('doc_from_docx_utf8.txt').write_text(text.encode('utf-8').decode('unicode_escape'), encoding='utf-8')
