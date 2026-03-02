(function () {
  const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  function daysInMonth(y, m) {
    const days = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[m - 1] || 0;
  }

  function isValidDate(y, m, d) {
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (m < 1 || m > 12 || d < 1) return false;
    return d <= daysInMonth(y, m);
  }

  // Sakamoto algorithm: 0=Sunday...6=Saturday
  function weekday(y, m, d) {
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let yy = y;
    if (m < 3) yy -= 1;
    return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
  }

  function parseYMD(input) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return isValidDate(y, mo, d) ? { y, m: mo, d } : null;
  }

  function parseMD(input, allowFeb29 = true) {
    const m = /^(\d{2})-(\d{2})$/.exec(input.trim());
    if (!m) return null;
    const mo = Number(m[1]);
    const d = Number(m[2]);
    if (mo < 1 || mo > 12 || d < 1) return null;
    if (mo === 2 && d === 29) return allowFeb29 ? { m: mo, d } : null;
    if (d > daysInMonth(2023, mo)) return null;
    return { m: mo, d };
  }

  function formatMD(m, d) {
    return `${pad2(m)}-${pad2(d)}`;
  }

  function formatYMD(y, m, d) {
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }

  function clampNYears(v) {
    if (!Number.isFinite(v)) return 5;
    return Math.max(1, Math.min(50, Math.floor(v)));
  }

  function renderTable(headers, rows) {
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const htr = document.createElement('tr');
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        if (cell instanceof Node) td.appendChild(cell);
        else td.textContent = String(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function rowsToTSV(headers, rows) {
    const out = [headers.join('\t')];
    rows.forEach((r) => {
      out.push(r.map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x) : '')).join('\t'));
    });
    return out.join('\n');
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  const currentYear = new Date().getFullYear();
  document.getElementById('startYear').value = currentYear;
  document.getElementById('rangeStartYear').value = currentYear;

  let mdRowsCache = [];
  let mdHeadersCache = [];
  let rankRaw = [];
  let rankHeadersCache = [];

  document.getElementById('singleCalc').addEventListener('click', () => {
    const input = document.getElementById('singleDate').value;
    const result = document.getElementById('singleResult');
    const parsed = parseYMD(input);
    if (!parsed) {
      result.textContent = '输入无效：请使用合法 YYYY-MM-DD（例如 2026-03-02）。';
      return;
    }
    const wd = weekday(parsed.y, parsed.m, parsed.d);
    result.textContent = `${formatYMD(parsed.y, parsed.m, parsed.d)} 是 ${WEEKDAY_ZH[wd]} (${WEEKDAY_EN[wd]})`;
  });

  document.getElementById('mdCalc').addEventListener('click', () => {
    const md = parseMD(document.getElementById('mdInput').value, true);
    const n = clampNYears(Number(document.getElementById('nYears').value));
    const startYear = Math.floor(Number(document.getElementById('startYear').value));
    const error = document.getElementById('mdError');
    const wrap = document.getElementById('mdTableWrap');
    wrap.innerHTML = '';
    error.textContent = '';

    if (!md) {
      error.textContent = '月日格式或取值无效，请输入合法 MM-DD（例如 03-01，02-29 允许）。';
      return;
    }
    if (!Number.isInteger(startYear) || startYear < 1) {
      error.textContent = '起始年份无效。';
      return;
    }

    const headers = ['Year', 'Date', 'Weekday'];
    const rows = [];
    for (let y = startYear; y < startYear + n; y++) {
      if (!isValidDate(y, md.m, md.d)) {
        rows.push([y, `${y}-${formatMD(md.m, md.d)}`, 'N/A (该年不存在此日期)']);
      } else {
        const wd = weekday(y, md.m, md.d);
        rows.push([y, formatYMD(y, md.m, md.d), `${WEEKDAY_ZH[wd]} (${WEEKDAY_EN[wd]})`]);
      }
    }
    mdHeadersCache = headers;
    mdRowsCache = rows;
    wrap.appendChild(renderTable(headers, rows));
  });

  document.getElementById('copyMdTable').addEventListener('click', async () => {
    if (!mdRowsCache.length) return;
    try {
      await copyText(rowsToTSV(mdHeadersCache, mdRowsCache));
      alert('已复制月日表格 TSV 到剪贴板。');
    } catch {
      alert('复制失败，请检查浏览器权限。');
    }
  });

  function* enumerateRangeForBaseYear(startMD, endMD, baseYear) {
    const crossYear = (startMD.m > endMD.m) || (startMD.m === endMD.m && startMD.d > endMD.d);
    if (!crossYear) {
      let m = startMD.m;
      let d = startMD.d;
      while (true) {
        yield { y: baseYear, m, d };
        if (m === endMD.m && d === endMD.d) break;
        d += 1;
        if (d > daysInMonth(baseYear, m)) {
          d = 1;
          m += 1;
        }
      }
    } else {
      let m = startMD.m;
      let d = startMD.d;
      while (true) {
        yield { y: baseYear, m, d };
        if (m === 12 && d === 31) break;
        d += 1;
        if (d > daysInMonth(baseYear, m)) {
          d = 1;
          m += 1;
        }
      }
      m = 1;
      d = 1;
      while (true) {
        yield { y: baseYear + 1, m, d };
        if (m === endMD.m && d === endMD.d) break;
        d += 1;
        if (d > daysInMonth(baseYear + 1, m)) {
          d = 1;
          m += 1;
        }
      }
    }
  }

  function computeRanking(startMD, endMD, startYear, n) {
    const perKey = new Map();
    let totalDays = 0;
    let totalWeekend = 0;
    const crossYear = (startMD.m > endMD.m) || (startMD.m === endMD.m && startMD.d > endMD.d);

    for (let y = startYear; y < startYear + n; y++) {
      for (const dt of enumerateRangeForBaseYear(startMD, endMD, y)) {
        if (!isValidDate(dt.y, dt.m, dt.d)) continue;
        const key = formatMD(dt.m, dt.d);
        const wd = weekday(dt.y, dt.m, dt.d);
        const weekend = wd === 0 || wd === 6;

        if (!perKey.has(key)) perKey.set(key, { key, weekendCount: 0, validYears: 0, satCount: 0, details: [] });
        const obj = perKey.get(key);
        obj.validYears += 1;
        if (weekend) obj.weekendCount += 1;
        if (wd === 6) obj.satCount += 1;
        obj.details.push(`${formatYMD(dt.y, dt.m, dt.d)} ${WEEKDAY_ZH[wd]}(${WEEKDAY_EN[wd]})`);

        totalDays += 1;
        if (weekend) totalWeekend += 1;
      }
    }

    const ranked = Array.from(perKey.values()).map((x) => ({
      ...x,
      probability: x.validYears ? x.weekendCount / x.validYears : 0,
    }));

    ranked.sort((a, b) => {
      if (b.probability !== a.probability) return b.probability - a.probability;
      if (a.key !== b.key) return a.key.localeCompare(b.key);
      return b.satCount - a.satCount;
    });

    return {
      ranked,
      crossYear,
      totalDays,
      totalWeekend,
    };
  }

  function buildRangeRows() {
    const filter = document.getElementById('rankFilter').value.trim();
    const topK = document.getElementById('topK').value;
    const arr = rankRaw.filter((r) => (!filter ? true : r.key.includes(filter)));
    const shown = topK === 'all' ? arr : arr.slice(0, Number(topK));
    return shown.map((r, idx) => {
      const detail = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '查看每年星期明细';
      detail.appendChild(summary);
      const p = document.createElement('div');
      p.textContent = r.details.join(' | ');
      detail.appendChild(p);
      return [idx + 1, r.key, `${r.weekendCount}/${r.validYears}`, (r.probability * 100).toFixed(2) + '%', detail];
    });
  }

  function rerenderRangeTable() {
    const wrap = document.getElementById('rangeTableWrap');
    wrap.innerHTML = '';
    const rows = buildRangeRows();
    wrap.appendChild(renderTable(rankHeadersCache, rows));
  }

  document.getElementById('rangeCalc').addEventListener('click', () => {
    const s = parseMD(document.getElementById('rangeStart').value, true);
    const e = parseMD(document.getElementById('rangeEnd').value, true);
    const n = clampNYears(Number(document.getElementById('rangeYears').value));
    const startYear = Math.floor(Number(document.getElementById('rangeStartYear').value));
    const err = document.getElementById('rangeError');
    const hint = document.getElementById('rangeHint');
    const overall = document.getElementById('overallRatio');

    err.textContent = '';
    hint.textContent = '';
    overall.textContent = '';

    if (!s || !e) {
      err.textContent = '区间起止格式或取值无效，请输入合法 MM-DD。';
      return;
    }
    if (!Number.isInteger(startYear) || startYear < 1) {
      err.textContent = '起始年份无效。';
      return;
    }

    const { ranked, crossYear, totalDays, totalWeekend } = computeRanking(s, e, startYear, n);
    rankRaw = ranked;
    rankHeadersCache = ['Rank', 'MM-DD', 'WeekendCount/ValidYears', 'Probability%', '细节'];
    if (crossYear) {
      hint.textContent = '提示：这是跨年区间，将按每个起始年份 y 展开为 y 年末 + (y+1) 年初。';
    }
    overall.textContent = `区间整体周末占比：${totalWeekend}/${totalDays} = ${((totalWeekend / totalDays) * 100).toFixed(2)}%`;
    rerenderRangeTable();
  });

  document.getElementById('rankFilter').addEventListener('input', rerenderRangeTable);
  document.getElementById('topK').addEventListener('change', rerenderRangeTable);

  document.getElementById('copyRangeTable').addEventListener('click', async () => {
    if (!rankRaw.length) return;
    const rows = buildRangeRows().map((r) => [r[0], r[1], r[2], r[3], '详见页面展开明细']);
    try {
      await copyText(rowsToTSV(rankHeadersCache, rows));
      alert('已复制排行 TSV 到剪贴板。');
    } catch {
      alert('复制失败，请检查浏览器权限。');
    }
  });

  document.getElementById('runSelfTest').addEventListener('click', () => {
    const out = document.getElementById('selfTestOutput');
    const tests = [
      ['1970-01-01', 4], // Thu
      ['2000-01-01', 6], // Sat
      ['2020-02-29', 6], // Sat
      ['2024-02-29', 4], // Thu
      ['2026-03-02', 1], // Mon
      ['1999-12-31', 5], // Fri
      ['2016-02-29', 1], // Mon
      ['1900-01-01', 1], // Mon
      ['2400-02-29', 2], // Tue
      ['2100-03-01', 1], // Mon
      ['2023-10-01', 0], // Sun
    ];

    const failures = [];
    tests.forEach(([date, expected]) => {
      const p = parseYMD(date);
      if (!p) {
        failures.push(`${date}: 解析失败`);
        return;
      }
      const got = weekday(p.y, p.m, p.d);
      if (got !== expected) {
        failures.push(`${date}: 期望 ${WEEKDAY_EN[expected]}，实际 ${WEEKDAY_EN[got]}`);
      }
    });

    if (failures.length === 0) {
      out.textContent = `通过：${tests.length} / ${tests.length} 条测试全部通过。`;
    } else {
      out.textContent = `失败：${failures.length} 条\n` + failures.join('\n');
    }
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
})();
