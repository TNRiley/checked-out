/* Index plate for the Quick Projects catalog, held here while Checked Out is kept off
 * the shelf (meta.json "catalog": false). To release: paste this block into PLATES in
 * catalog/tools/catalog_template.html, remove the catalog flag, rebuild the catalog. */
  "checked-out"(g, w, h, t){
    // a date-due card: stamps crowd the early rows and thin out down the years,
    // the last of them struck in electronic ochre rather than circulation violet
    const r = rng("checked-out");
    g.fillStyle = "rgba(255,255,255,.045)";
    g.fillRect(w * 0.07, h * 0.05, w * 0.86, h * 0.90);
    g.strokeStyle = "rgba(150,140,185,.22)"; g.lineWidth = 1;
    g.strokeRect(w * 0.07, h * 0.05, w * 0.86, h * 0.90);
    const rows = 9, cols = 3;
    const x0 = w * 0.11, y0 = h * 0.12, dx = (w * 0.78) / cols, dy = (h * 0.78) / rows;
    const glow = REDUCED ? -1 : Math.floor((t / 900) % rows);
    for (let i = 0; i < rows; i++){
      const yy = y0 + i * dy;
      g.strokeStyle = "rgba(150,140,185,.16)";
      g.beginPath(); g.moveTo(x0, yy + dy * 0.80); g.lineTo(x0 + dx * cols, yy + dy * 0.80); g.stroke();
      const density = 1 - (i / (rows - 1)) * 0.76;
      for (let c = 0; c < cols; c++){
        if (r() > density) continue;
        const elec = i > rows * 0.60 && r() < 0.55;
        const lift = (i === glow) ? 0.26 : 0;
        g.save();
        g.translate(x0 + c * dx + dx * 0.42, yy + dy * 0.38);
        g.rotate((r() - 0.5) * 0.12);
        g.fillStyle = elec ? `rgba(198,146,58,${0.34 + lift})` : `rgba(124,108,196,${0.34 + lift})`;
        g.fillRect(-dx * 0.30, -dy * 0.22, dx * 0.60, dy * 0.44);
        g.fillStyle = elec ? `rgba(242,210,148,${0.72 + lift})` : `rgba(208,201,242,${0.72 + lift})`;
        for (let k = 0; k < 3; k++)
          g.fillRect(-dx * 0.21, -dy * 0.13 + k * dy * 0.11, dx * 0.42 * (0.55 + r() * 0.45), dy * 0.05);
        g.restore();
      }
    }
  },
