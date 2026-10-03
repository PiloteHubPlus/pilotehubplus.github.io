# PiloteHub Curriculum Upload Tree Structure

Upload your curriculum files directly into this tree structure:

```
public/curriculum/
├── <grade>/
│   ├── <subject>/
│   │   ├── courses/       <- Place course PDFs or JSON sidecars here
│   │   ├── exercises/     <- Place exercise PDFs or JSON sidecars here
│   │   └── exams/         <- Place exam PDFs or JSON sidecars here
```

### Supported Grades:
- `7th-grade` (7ème Année de Base)
- `8th-grade` (8ème Année de Base)
- `9th-grade` (9ème Année de Base)
- `1st-secondary` (1ère Année Secondaire - Freshman)
- `2nd-secondary` (2ème Année Secondaire - Sophomore)
- `3rd-secondary` (3ème Année Secondaire - Junior)
- `4th-secondary` (4ème Année Secondaire / Baccalauréat - Senior)

### Supported Subjects:
- `math` (Mathématiques)
- `physics` (Sciences Physiques)
- `science` (Sciences de la Vie et de la Terre - SVT)
- `arabic` (Arabe)
- `french` (Français)
- `english` (Anglais)
- `technology` (Technologie)
- `computer-science` (Informatique)
- `islamic-education` (Éducation Islamique)
- `civic-education` (Éducation Civique)
- `history` (Histoire)
- `geography` (Géographie)
- `philosophy` (Philosophie - 3ème & 4ème secondaire)
- `optional-language` (Langue Optionnelle - Allemand / Italien / Espagnol)

### File Format:
1. **PDF**: Simply upload `filename.pdf`.
2. **Optional JSON Sidecar**: `filename.json` with:
```json
{
  "title": "Document Title",
  "description": "Short summary or description",
  "estimatedMinutes": 30,
  "pages": 4,
  "term": 1,
  "keyPoints": [
    "Key concept 1",
    "Key concept 2"
  ]
}
```
