import os

# Folder yang ingin kamu ambil
TARGET_DIRS = ['src/app/chat', 'src/components', 'src/context', 'src/utils']

def generate_structure_and_content(base_path, target_dirs):
    structure = []
    content = []

    for target in target_dirs:
        target_path = os.path.join(base_path, target)
        if not os.path.isdir(target_path):
            print(f"Folder '{target}' tidak ditemukan, dilewati.")
            continue

        for root, dirs, files in os.walk(target_path):
            level = root.replace(base_path, '').count(os.sep)
            indent = '  ' * level
            folder_name = os.path.basename(root)
            structure.append(f"{indent}{folder_name}/")

            sub_indent = '  ' * (level + 1)
            for f in files:
                structure.append(f"{sub_indent}{f}")
                file_path = os.path.join(root, f)
                relative_path = os.path.relpath(file_path, base_path)
                try:
                    with open(file_path, 'r', encoding='utf-8') as file_content:
                        content.append(f"\n/{relative_path}\n{'-' * 40}\n{file_content.read()}")
                except Exception as e:
                    content.append(f"\n/{relative_path}\n{'-' * 40}\nError reading file: {e}")

    return "\n".join(structure), "\n".join(content)

if __name__ == "__main__":
    project_root = os.getcwd()

    structure, content = generate_structure_and_content(project_root, TARGET_DIRS)

    output_file = 'backend.txt'

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("STRUKTUR DIREKTORI\n" + "="*20 + "\n")
        f.write(structure)
        f.write("\n\nDETAIL FILE\n" + "="*20 + "\n")
        f.write(content)

    print(f"Hasil telah disimpan di {output_file}")