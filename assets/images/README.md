# Image slots

Drop real photos here and replace the labelled placeholder markup in
`sections/*.html`. Each slot is marked with an HTML comment.

| Slot | File name                            | Ratio | Size      | What it should be |
|------|--------------------------------------|-------|-----------|-------------------|
| 01   | hero-portrait.jpg                    | 4:5   | 1200×1500 | You with a drone  |
| 02   | project-delivery-drone.jpg           | 16:10 | 1600×1000 | Delivery drone airframe |
| 03   | project-nidar.jpg                    | 16:10 | 1600×1000 | Dual-drone / ground station |
| 04   | exp-nitk.jpg                         | 4:3   | 1200×900  | NITK lab / test rig |
| 05   | exp-charak.jpg                       | 4:3   | 1200×900  | Charak field test |
| 06   | about-portrait.jpg                   | 3:4   | 1200×1600 | Candid workshop shot |

To use one:

```html
<div class="media-slot">
    <img src="assets/images/hero-portrait.jpg" alt="Sibasish Barik with a delivery drone">
</div>
```

The dashed placeholder styling disappears automatically once an `<img>` is inside.
Also drop your CV at `assets/Sibasish_Barik_Resume.pdf` for the navbar Resume button.
