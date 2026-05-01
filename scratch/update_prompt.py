import re

file_path = 'd:/Codes/piko/piko_system_prompt.txt'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for rule 7
old_rule = r"7\. Properly establish `isRelationalSource: true` on fields meant to be display titles \(e\.g\. 'Product Name', 'Player Name'\), and use `type: reference` with `targetFormId` for relations\."
new_rule = """7. MULTI-FORM REQUESTS: If the user requests multiple forms (e.g., 'two forms', 'forms for A and B', 'track valorant stats of player'), you MUST sequentially create EACH form one by one. Do NOT stop after the first one. Issue the first `create_form` action, wait for the success observation, then issue the second `create_form` action, and so on until ALL requested forms are created, before finally issuing `task_complete`.
8. RELATIONS: Properly establish `isRelationalSource: true` on fields meant to be display titles (e.g. 'Product Name', 'Player Name'), and use `type: reference` with `reference: {"collection": "target_form_id_or_name", "displayField": "name_of_target_field"}` for relations. If a form relates to another, ensure the reference is created correctly."""

content = re.sub(old_rule, new_rule, content)

# Pattern for STOP CONDITION
old_cond = r"1\. EXACT STOP CONDITION: Once you have completed the specific sequence of actions requested by the user, YOU MUST IMMEDIATELY STOP by outputting ONLY:"
new_cond = r"1. EXACT STOP CONDITION: Once you have completed the specific sequence of actions requested by the user (e.g. creating ALL requested forms sequentially), YOU MUST IMMEDIATELY STOP by outputting ONLY:"

content = re.sub(old_cond, new_cond, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated successfully')
