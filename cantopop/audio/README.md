# Recorded voice lines

Each line plays from `<id>.m4a` (or `<id>.mp3`) in this folder. iPhone Voice Memos exports
`.m4a`, so you can record on your phone, rename, and drop the file in.

The files here now are placeholders made with the Mac's Cantonese voice (Sinji) by `npm run audio`.
To use your own recording, replace the file with the same name. `npm run audio` never
overwrites existing files (add `-- --force` to remake all of them).

| File | Line |
|---|---|
| `name_question.m4a` | 你好小朋友，你叫咩名呀？ |
| `age_question.m4a` | 你好俞藍。你今年幾多歲呀？ |
| `retry.m4a` | 唔好意思，我聽唔清楚。可唔可以再講多次呀？ |
| `start_invite_1.m4a` … `start_invite_12.m4a` | 哇，你一/兩/三…歲呀！我哋一齊學廣東話，好唔好？ (one per age) |
| `hou.m4a` | 好！ |

The full list lives in `src/content/lines.ts`.
