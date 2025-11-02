#!/usr/bin/env bash

OUT=all_files.txt
> "$OUT"

# dirs to prune anywhere in the tree (by basename)
PRUNE_DIRNAMES=(.git node_modules .svelte-kit build dist)

# individual filenames to omit anywhere
PRUNE_FILES=(all_files.txt generate-context.sh package-lock.json)

# build prune expression for dirs (match by -name, any depth)
PRUNE_EXPR=(-type d \( )
for i in "${!PRUNE_DIRNAMES[@]}"; do
  name="${PRUNE_DIRNAMES[$i]}"
  if [[ $i -gt 0 ]]; then PRUNE_EXPR+=(-o); fi
  PRUNE_EXPR+=(-name "$name")
done
PRUNE_EXPR+=( \) -prune )

# build omit expression for files (omit by basename)
OMIT_EXPR=()
for f in "${PRUNE_FILES[@]}"; do OMIT_EXPR+=(! -name "$f"); done

# --- hierarchy ---
{
  echo "==============================="
  echo "======== PROJECT TREE ========="
  echo "==============================="
} >> "$OUT"

# list files, pruning dirs recursively
find . \( "${PRUNE_EXPR[@]}" \) -o -type f "${OMIT_EXPR[@]}" -print | sort >> "$OUT"
echo -e "\n\n" >> "$OUT"

# --- file contents ---
find . \( "${PRUNE_EXPR[@]}" \) -o -type f \
  "${OMIT_EXPR[@]}" \
  ! -iregex '.*\.\(png\|jpg\|jpeg\|ico\|webp\|cache\|log\|svg\)$' -print0 |
while IFS= read -r -d '' file; do
  {
    echo "=============================================="
    echo ">>> START FILE: $file"
    echo "=============================================="
    cat "$file"
    echo
    echo "=============================================="
    echo "<<< END FILE: $file"
    echo "=============================================="
    echo
  } >> "$OUT"
done
