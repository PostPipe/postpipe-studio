file_path = 'd:/Codes/piko/piko_system_prompt.txt'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

valorant_addition = '''- Valorant Player and Stats: 
  Form 1 - Valorant Player: {"name": "Valorant Player", "fields": [{"name": "Riot ID", "type": "text", "required": true, "isRelationalSource": true}, {"name": "Region", "type": "enum", "options": "NA,EU,AP,KR,BR,LATAM"}, {"name": "Main Agent", "type": "text"}]}
  Form 2 - Valorant Match Stats: {"name": "Valorant Match Stats", "fields": [{"name": "Player", "type": "reference", "reference": {"collection": "Valorant Player", "displayField": "Riot ID"}}, {"name": "Map", "type": "text"}, {"name": "Kills", "type": "number"}, {"name": "Deaths", "type": "number"}, {"name": "Assists", "type": "number"}, {"name": "ACS", "type": "number"}]}

### SUPPORTED ACTIONS:'''

content = content.replace('### SUPPORTED ACTIONS:', valorant_addition)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced!')
