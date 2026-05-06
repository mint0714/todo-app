import shutil
import sys
import zipfile

from lxml import etree


src = sys.argv[1] if len(sys.argv) > 1 else "output.docx"
tmp = f"{src}.fixed"
ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
order = ["top", "left", "bottom", "right", "bar", "between"]


with zipfile.ZipFile(src, "r") as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "word/document.xml":
            tree = etree.fromstring(data)
            for pbdr in tree.iter(f"{{{ns}}}pBdr"):
                children = list(pbdr)
                child_map = {c.tag.split("}", 1)[1]: c for c in children}
                for child in children:
                    pbdr.remove(child)
                for key in order:
                    if key in child_map:
                        pbdr.append(child_map[key])
            data = etree.tostring(tree, xml_declaration=True, encoding="UTF-8", standalone=True)
        zout.writestr(item, data)

shutil.move(tmp, src)
print("pBdr fixed")
