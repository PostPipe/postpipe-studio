import re

file_path = 'd:/Codes/postpipe-studio/components/chat/piko-chat-window.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the SnippetBlock function definition completely
pattern = re.compile(r'function SnippetBlock\(.*?\)\s*\{.*?\n\}\n', re.DOTALL)
content = pattern.sub('', content)

new_render = """  const renderMessageContent = (content: string, isPiko: boolean = false) => {
    const trimmed = content.trim();

    if (isPiko) {
      try {
        const match = content.match(/\\{[\\s\\S]*\\}/);
        if (match) {
          const data = JSON.parse(match[0]);
          if (data.action) {
            if (data.action === "ask_clarification") return <p>{data.params?.question || ""}</p>;
            if (data.action === "task_complete") return <p>{data.params?.message || "Task completed."}</p>;
            return null;
          }
        }
      } catch (e) { }

      if (trimmed.startsWith('{"action"')) return null;
    }

    const cleanContent = content.replace(/```\\w*\\n?/g, '').replace(/```/g, '');
    return <p className="whitespace-pre-wrap mb-2 last:mb-0">{cleanContent}</p>;
  };"""

old_render_pattern = re.compile(r'const renderMessageContent = \(content: string, isPiko: boolean = false\) => \{[\s\S]*?return parts;\n  \};', re.DOTALL)

content = old_render_pattern.sub(new_render, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('SnippetBlock removed entirely from piko-chat-window.tsx')
