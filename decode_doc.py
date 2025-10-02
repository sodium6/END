from pathlib import Path
path = Path('doc_text_tis620.txt')
data = path.read_bytes()
outputs = []
for enc in ['utf-8', 'cp874', 'tis-620', 'latin-1']:
    try:
        text = data.decode(enc)
    except Exception as exc:
        outputs.append(f'!!! failed {enc}: {exc}')
    else:
        outputs.append(f'--- decoded with {enc} ---')
        outputs.append(text)
Path('decoded_doc.txt').write_text('\n\n'.join(outputs), encoding='utf-8')
