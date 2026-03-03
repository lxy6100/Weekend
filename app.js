(function () {
  const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63
  ];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function formatMD(m, d) { return `${pad2(m)}-${pad2(d)}`; }
  function formatYMD(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}`; }

  function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function daysInMonth(y, m) {
    const arr = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return arr[m - 1] || 0;
  }
  function isValidDate(y, m, d) {
    return Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
  }

  // 0=Sun ... 6=Sat
  function weekday(y, m, d) {
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let yy = y;
    if (m < 3) yy -= 1;
    return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
  }

  function parseYMD(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return isValidDate(y, mo, d) ? { y, m: mo, d } : null;
  }

  function parseMD(v) {
    const m = /^(\d{2})-(\d{2})$/.exec(v.trim());
    if (!m) return null;
    const mo = Number(m[1]);
    const d = Number(m[2]);
    if (mo < 1 || mo > 12 || d < 1) return null;
    if (mo === 2 && d === 29) return { m: mo, d };
    if (d > daysInMonth(2023, mo)) return null;
    return { m: mo, d };
  }

  function parsePositiveInt(v) {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }

  function readMDFromInputs(monthId, dayId) {
    const m = parsePositiveInt(document.getElementById(monthId).value);
    const d = parsePositiveInt(document.getElementById(dayId).value);
    if (!m || !d) return null;
    if (m < 1 || m > 12) return null;
    if (m === 2 && d === 29) return { m, d };
    if (d > daysInMonth(2023, m)) return null;
    return { m, d };
  }

  function readYMDFromInputs(yearId, monthId, dayId) {
    const y = parsePositiveInt(document.getElementById(yearId).value);
    const m = parsePositiveInt(document.getElementById(monthId).value);
    const d = parsePositiveInt(document.getElementById(dayId).value);
    if (!y || !m || !d) return null;
    return isValidDate(y, m, d) ? { y, m, d } : null;
  }

  function addDaysUTC(y, m, d, offsetDays) {
    const utcMs = Date.UTC(y, m - 1, d) + offsetDays * 24 * 60 * 60 * 1000;
    const dt = new Date(utcMs);
    return {
      y: dt.getUTCFullYear(),
      m: dt.getUTCMonth() + 1,
      d: dt.getUTCDate(),
    };
  }

  function clampNYears(v) {
    if (!Number.isFinite(v)) return 5;
    return Math.max(1, Math.min(50, Math.floor(v)));
  }

  function dayOfYear(y, m, d) {
    let sum = 0;
    for (let mm = 1; mm < m; mm++) sum += daysInMonth(y, mm);
    return sum + d;
  }

  function solarDaysBetween19000131(y, m, d) {
    let days = 0;
    for (let yy = 1900; yy < y; yy++) days += isLeapYear(yy) ? 366 : 365;
    days += dayOfYear(y, m, d) - dayOfYear(1900, 1, 31);
    return days;
  }

  function lunarLeapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
  function lunarLeapDays(y) { return lunarLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0; }
  function lunarMonthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
  function lunarYearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
    return sum + lunarLeapDays(y);
  }

  function solarToLunar(y, m, d) {
    if (y < 1900 || y > 2100 || !isValidDate(y, m, d)) return null;
    let offset = solarDaysBetween19000131(y, m, d);
    let lunarYear = 1900;
    let temp = 0;
    while (lunarYear < 2101 && offset >= (temp = lunarYearDays(lunarYear))) {
      offset -= temp;
      lunarYear += 1;
    }
    let leap = lunarLeapMonth(lunarYear);
    let isLeap = false;
    let lunarMonth = 1;
    while (lunarMonth <= 12) {
      if (leap > 0 && lunarMonth === leap + 1 && !isLeap) {
        lunarMonth -= 1;
        isLeap = true;
        temp = lunarLeapDays(lunarYear);
      } else {
        temp = lunarMonthDays(lunarYear, lunarMonth);
      }
      if (offset < temp) break;
      offset -= temp;
      if (isLeap && lunarMonth === leap) isLeap = false;
      lunarMonth += 1;
    }
    return { lunarYear, lunarMonth, lunarDay: offset + 1, isLeap };
  }

  // 清明公式（适用于 1900-2099）
  function qingmingDay(year) {
    if (year < 1900 || year > 2099) return 4;
    const C = year <= 1999 ? 5.59 : 4.81;
    const y = year % 100;
    let day = Math.floor(y * 0.2422 + C) - Math.floor((y - 1) / 4);
    if (year === 2008) day += 1;
    if (year === 1902 || year === 1928 || year === 1976 || year === 2016 || year === 2021) day += 1;
    if (year === 1911 || year === 1914 || year === 1932 || year === 1951 || year === 1979 || year === 1983) day -= 1;
    return day;
  }

  function isRuleHoliday(y, m, d) {
    const md = formatMD(m, d);
    if (md === '01-01') return { hit: true, name: '元旦' };
    if (md === '05-01' || md === '05-02') return { hit: true, name: '劳动节' };
    if (md === '10-01' || md === '10-02' || md === '10-03') return { hit: true, name: '国庆节' };
    if (m === 4 && d === qingmingDay(y)) return { hit: true, name: '清明节' };

    const lunar = solarToLunar(y, m, d);
    if (!lunar) return { hit: false, name: '' };
    if (!lunar.isLeap && lunar.lunarMonth === 1 && lunar.lunarDay >= 1 && lunar.lunarDay <= 3) return { hit: true, name: '春节' };
    if (!lunar.isLeap && lunar.lunarMonth === 5 && lunar.lunarDay === 5) return { hit: true, name: '端午节' };
    if (!lunar.isLeap && lunar.lunarMonth === 8 && lunar.lunarDay === 15) return { hit: true, name: '中秋节' };

    const nextDay = nextDate(y, m, d);
    const nextLunar = solarToLunar(nextDay.y, nextDay.m, nextDay.d);
    if (nextLunar && !nextLunar.isLeap && nextLunar.lunarMonth === 1 && nextLunar.lunarDay === 1) return { hit: true, name: '春节(除夕)' };

    return { hit: false, name: '' };
  }

  function nextDate(y, m, d) {
    let ny = y;
    let nm = m;
    let nd = d + 1;
    if (nd > daysInMonth(ny, nm)) {
      nd = 1;
      nm += 1;
      if (nm > 12) {
        nm = 1;
        ny += 1;
      }
    }
    return { y: ny, m: nm, d: nd };
  }

  function dateKey(obj) { return formatYMD(obj.y, obj.m, obj.d); }

  let holidayMode = 'rule';
  let calendarData = null;

  const sampleCalendar2026 = {
    2026: {
      off: [
        '2026-01-01','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22',
        '2026-04-05','2026-05-01','2026-05-02','2026-05-03','2026-06-19','2026-09-25','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07'
      ],
      work: ['2026-02-15','2026-02-28','2026-10-10']
    }
  };

  function parseCalendarJSON(text) {
    const raw = JSON.parse(text);
    const normalized = {};
    Object.keys(raw).forEach((yearKey) => {
      const item = raw[yearKey] || {};
      if (!Array.isArray(item.off) || !Array.isArray(item.work)) throw new Error(`年份 ${yearKey} 缺少 off/work 数组`);
      const offSet = new Set();
      const workSet = new Set();
      item.off.forEach((s) => {
        const p = parseYMD(s);
        if (!p) throw new Error(`off 包含非法日期: ${s}`);
        offSet.add(dateKey(p));
      });
      item.work.forEach((s) => {
        const p = parseYMD(s);
        if (!p) throw new Error(`work 包含非法日期: ${s}`);
        workSet.add(dateKey(p));
      });
      normalized[yearKey] = { off: offSet, work: workSet };
    });
    return normalized;
  }

  function calendarDecision(y, m, d) {
    if (!calendarData) return { enabled: false, isRest: false, reason: '未加载日历数据' };
    const key = formatYMD(y, m, d);
    const yearObj = calendarData[String(y)] || { off: new Set(), work: new Set() };
    if (yearObj.work.has(key)) return { enabled: true, isRest: false, reason: '调休补班(work)' };
    if (yearObj.off.has(key)) return { enabled: true, isRest: true, reason: '官方休息(off)' };
    const wd = weekday(y, m, d);
    return { enabled: true, isRest: wd === 0 || wd === 6, reason: wd === 0 || wd === 6 ? '周末' : '普通工作日' };
  }

  function getMetricOptions() {
    if (holidayMode === 'rule') {
      return [
        { value: 'weekend', label: '周末概率' },
        { value: 'holiday', label: '节假日概率（规则法定节日本体日）' },
        { value: 'rest', label: '休息日概率（周末 OR 规则节假日）' }
      ];
    }
    return [
      { value: 'off', label: '官方休息日 off 概率' },
      { value: 'calendarRest', label: '休息日概率（off + 周末 - work）' },
      { value: 'holiday', label: '法定节日本体日概率（规则对照）' }
    ];
  }

  function refreshMetricSelect() {
    const el = document.getElementById('rankMetric');
    const old = el.value;
    el.innerHTML = '';
    getMetricOptions().forEach((o) => {
      const op = document.createElement('option');
      op.value = o.value;
      op.textContent = o.label;
      el.appendChild(op);
    });
    if ([...el.options].some((x) => x.value === old)) el.value = old;
  }

  function renderTable(headers, rows) {
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      r.forEach((c) => {
        const td = document.createElement('td');
        if (c instanceof Node) td.appendChild(c); else td.textContent = String(c);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function rowsToTSV(headers, rows) {
    return [headers.join('\t')].concat(rows.map((r) => r.map((c) => (typeof c === 'string' || typeof c === 'number') ? String(c) : '').join('\t'))).join('\n');
  }

  async function copyText(s) { await navigator.clipboard.writeText(s); }

  function* enumerateRangeForBaseYear(startMD, endMD, baseYear) {
    const crossYear = startMD.m > endMD.m || (startMD.m === endMD.m && startMD.d > endMD.d);
    if (!crossYear) {
      let m = startMD.m;
      let d = startMD.d;
      while (true) {
        yield { y: baseYear, m, d };
        if (m === endMD.m && d === endMD.d) break;
        d += 1;
        if (d > daysInMonth(baseYear, m)) { d = 1; m += 1; }
      }
    } else {
      let m = startMD.m;
      let d = startMD.d;
      while (true) {
        yield { y: baseYear, m, d };
        if (m === 12 && d === 31) break;
        d += 1;
        if (d > daysInMonth(baseYear, m)) { d = 1; m += 1; }
      }
      m = 1; d = 1;
      while (true) {
        yield { y: baseYear + 1, m, d };
        if (m === endMD.m && d === endMD.d) break;
        d += 1;
        if (d > daysInMonth(baseYear + 1, m)) { d = 1; m += 1; }
      }
    }
  }

  function computeMetricForDate(y, m, d, metric) {
    const wd = weekday(y, m, d);
    const isWeekend = wd === 0 || wd === 6;
    const holiday = isRuleHoliday(y, m, d).hit;
    if (metric === 'weekend') return { hit: isWeekend, note: WEEKDAY_ZH[wd] };
    if (metric === 'holiday') return { hit: holiday, note: holiday ? '规则节假日' : '-' };
    if (metric === 'rest') return { hit: isWeekend || holiday, note: isWeekend || holiday ? '周末或节假日' : '-' };

    const key = formatYMD(y, m, d);
    const yearObj = calendarData && calendarData[String(y)] ? calendarData[String(y)] : { off: new Set(), work: new Set() };
    if (metric === 'off') return { hit: yearObj.off.has(key), note: yearObj.off.has(key) ? 'off' : '-' };
    if (metric === 'calendarRest') {
      if (yearObj.work.has(key)) return { hit: false, note: 'work覆盖' };
      if (yearObj.off.has(key)) return { hit: true, note: 'off' };
      return { hit: isWeekend, note: isWeekend ? '周末' : '-' };
    }
    return { hit: false, note: '-' };
  }

  function computeRanking(startMD, endMD, startYear, n, metric) {
    const perKey = new Map();
    let totalDays = 0;
    let totalHit = 0;
    const crossYear = startMD.m > endMD.m || (startMD.m === endMD.m && startMD.d > endMD.d);

    for (let y = startYear; y < startYear + n; y++) {
      for (const dt of enumerateRangeForBaseYear(startMD, endMD, y)) {
        if (!isValidDate(dt.y, dt.m, dt.d)) continue;
        const key = formatMD(dt.m, dt.d);
        const m = computeMetricForDate(dt.y, dt.m, dt.d, metric);

        if (!perKey.has(key)) perKey.set(key, { key, hitCount: 0, validYears: 0, satCount: 0, details: [] });
        const obj = perKey.get(key);
        obj.validYears += 1;
        if (m.hit) obj.hitCount += 1;
        if (weekday(dt.y, dt.m, dt.d) === 6) obj.satCount += 1;
        obj.details.push(`${formatYMD(dt.y, dt.m, dt.d)} ${m.hit ? '✓' : '✗'} ${m.note}`);

        totalDays += 1;
        if (m.hit) totalHit += 1;
      }
    }

    const ranked = Array.from(perKey.values()).map((x) => ({ ...x, probability: x.validYears ? x.hitCount / x.validYears : 0 }));
    ranked.sort((a, b) => {
      if (b.probability !== a.probability) return b.probability - a.probability;
      if (a.key !== b.key) return a.key.localeCompare(b.key);
      return b.satCount - a.satCount;
    });
    return { ranked, totalDays, totalHit, crossYear };
  }

  const currentYear = new Date().getFullYear();
  document.getElementById('singleYear').value = currentYear;
  document.getElementById('startYear').value = currentYear;
  document.getElementById('rangeStartYear').value = currentYear;
  document.getElementById('calendarJson').value = JSON.stringify(sampleCalendar2026, null, 2);
  document.getElementById('singleMonth').value = 3;
  document.getElementById('singleDay').value = 2;
  document.getElementById('mdMonth').value = 3;
  document.getElementById('mdDay').value = 1;
  document.getElementById('rangeStartMonth').value = 3;
  document.getElementById('rangeStartDay').value = 1;
  document.getElementById('rangeEndMonth').value = 4;
  document.getElementById('rangeEndDay').value = 1;
  document.getElementById('anniversaryYear').value = currentYear;
  document.getElementById('anniversaryMonth').value = 3;
  document.getElementById('anniversaryDay').value = 2;
  document.getElementById('anniversaryOffset').value = 100;

  let mdRowsCache = [];
  let mdHeadersCache = [];
  let rankRaw = [];
  let rankHeaders = [];

  document.getElementById('singleCalc').addEventListener('click', () => {
    const out = document.getElementById('singleResult');
    const parsed = readYMDFromInputs('singleYear', 'singleMonth', 'singleDay');
    if (!parsed) {
      out.textContent = '输入无效：请填写合法 年/月/日（月份和日期可填 3 或 03）。';
      return;
    }
    const wd = weekday(parsed.y, parsed.m, parsed.d);
    const isWeekend = wd === 0 || wd === 6;
    const rule = isRuleHoliday(parsed.y, parsed.m, parsed.d);
    const cal = calendarDecision(parsed.y, parsed.m, parsed.d);
    out.innerHTML = [
      `${formatYMD(parsed.y, parsed.m, parsed.d)}：${WEEKDAY_ZH[wd]} (${WEEKDAY_EN[wd]})`,
      `是否周末：${isWeekend ? '是' : '否'}`,
      `是否节假日（规则模式）：${rule.hit ? '是' : '否'}${rule.name ? `（${rule.name}）` : ''}`,
      `是否休息日（日历模式）：${cal.enabled ? (cal.isRest ? '是' : '否') : '未启用'}（${cal.reason}）`
    ].join('<br>');
  });

  document.getElementById('mdCalc').addEventListener('click', () => {
    const md = readMDFromInputs('mdMonth', 'mdDay');
    const n = clampNYears(Number(document.getElementById('nYears').value));
    const startYear = Math.floor(Number(document.getElementById('startYear').value));
    const err = document.getElementById('mdError');
    const wrap = document.getElementById('mdTableWrap');
    err.textContent = '';
    wrap.innerHTML = '';
    if (!md) {
      err.textContent = '月日无效：请填写合法 月/日（支持 3 或 03；02-29 允许）。';
      return;
    }
    if (!Number.isInteger(startYear) || startYear < 1) {
      err.textContent = '起始年份无效。';
      return;
    }
    const headers = ['Year', 'Date', 'Weekday'];
    const rows = [];
    for (let y = startYear; y < startYear + n; y++) {
      if (!isValidDate(y, md.m, md.d)) rows.push([y, `${y}-${formatMD(md.m, md.d)}`, 'N/A (该年不存在)']);
      else {
        const wd = weekday(y, md.m, md.d);
        rows.push([y, formatYMD(y, md.m, md.d), `${WEEKDAY_ZH[wd]} (${WEEKDAY_EN[wd]})`]);
      }
    }
    mdRowsCache = rows;
    mdHeadersCache = headers;
    wrap.appendChild(renderTable(headers, rows));
  });

  document.getElementById('copyMdTable').addEventListener('click', async () => {
    if (!mdRowsCache.length) return;
    try { await copyText(rowsToTSV(mdHeadersCache, mdRowsCache)); alert('已复制 TSV。'); }
    catch { alert('复制失败，请检查权限。'); }
  });

  function buildRangeRows() {
    const filter = document.getElementById('rankFilter').value.trim();
    const topK = document.getElementById('topK').value;
    const filtered = rankRaw.filter((x) => !filter || x.key.includes(filter));
    const shown = topK === 'all' ? filtered : filtered.slice(0, Number(topK));
    return shown.map((r, i) => {
      const detail = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '查看每年明细';
      detail.appendChild(summary);
      const div = document.createElement('div');
      div.textContent = r.details.join(' | ');
      detail.appendChild(div);
      return [i + 1, r.key, `${r.hitCount}/${r.validYears}`, `${(r.probability * 100).toFixed(2)}%`, detail];
    });
  }

  function rerenderRange() {
    const wrap = document.getElementById('rangeTableWrap');
    wrap.innerHTML = '';
    if (!rankRaw.length) return;
    wrap.appendChild(renderTable(rankHeaders, buildRangeRows()));
  }

  document.getElementById('rangeCalc').addEventListener('click', () => {
    const s = readMDFromInputs('rangeStartMonth', 'rangeStartDay');
    const e = readMDFromInputs('rangeEndMonth', 'rangeEndDay');
    const n = clampNYears(Number(document.getElementById('rangeYears').value));
    const startYear = Math.floor(Number(document.getElementById('rangeStartYear').value));
    const metric = document.getElementById('rankMetric').value;
    const err = document.getElementById('rangeError');
    const hint = document.getElementById('rangeHint');
    const overall = document.getElementById('overallRatio');
    err.textContent = '';
    hint.textContent = '';
    overall.textContent = '';
    if (!s || !e) {
      err.textContent = '区间起止格式无效。';
      return;
    }
    if (!Number.isInteger(startYear) || startYear < 1) {
      err.textContent = '起始年份无效。';
      return;
    }
    if ((metric === 'off' || metric === 'calendarRest') && !calendarData) {
      err.textContent = '当前维度依赖日历模式 JSON，请先加载。';
      return;
    }
    const res = computeRanking(s, e, startYear, n, metric);
    rankRaw = res.ranked;
    rankHeaders = ['Rank', 'MM-DD', 'HitCount/ValidYears', 'Probability%', '细节'];
    if (res.crossYear) hint.textContent = '提示：跨年区间会按每个基准年 y 展开为 y 年末 + (y+1) 年初。';
    overall.textContent = `区间整体占比：${res.totalHit}/${res.totalDays} = ${((res.totalHit / res.totalDays) * 100).toFixed(2)}%`;
    rerenderRange();
  });

  document.getElementById('rankFilter').addEventListener('input', rerenderRange);
  document.getElementById('topK').addEventListener('change', rerenderRange);

  document.getElementById('copyRangeTable').addEventListener('click', async () => {
    if (!rankRaw.length) return;
    const rows = buildRangeRows().map((r) => [r[0], r[1], r[2], r[3], '详见页面展开']);
    try { await copyText(rowsToTSV(rankHeaders, rows)); alert('已复制 TSV。'); }
    catch { alert('复制失败，请检查权限。'); }
  });

  document.querySelectorAll('input[name="holidayMode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      holidayMode = document.querySelector('input[name="holidayMode"]:checked').value;
      document.getElementById('modeHint').textContent = holidayMode === 'rule'
        ? '规则模式：可预测未来 N 年，不含调休拼假。'
        : '日历模式：按 off/work 精确判定，未配置年份默认仅按周末规则。';
      refreshMetricSelect();
    });
  });

  document.getElementById('useSampleJson').addEventListener('click', () => {
    document.getElementById('calendarJson').value = JSON.stringify(sampleCalendar2026, null, 2);
  });

  document.getElementById('calendarFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const txt = await file.text();
    document.getElementById('calendarJson').value = txt;
  });

  document.getElementById('loadCalendar').addEventListener('click', () => {
    const status = document.getElementById('calendarStatus');
    const err = document.getElementById('calendarError');
    status.textContent = '';
    err.textContent = '';
    try {
      const parsed = parseCalendarJSON(document.getElementById('calendarJson').value);
      calendarData = parsed;
      const years = Object.keys(parsed).sort();
      status.textContent = `加载成功：${years.length} 个年份（${years.join(', ')}）`;
    } catch (ex) {
      err.textContent = `解析失败：${ex.message}`;
      calendarData = null;
    }
  });


  document.getElementById('anniversaryCalc').addEventListener('click', () => {
    const err = document.getElementById('anniversaryError');
    const out = document.getElementById('anniversaryResult');
    err.textContent = '';
    out.textContent = '';

    const start = readYMDFromInputs('anniversaryYear', 'anniversaryMonth', 'anniversaryDay');
    const offset = Number(document.getElementById('anniversaryOffset').value);

    if (!start) {
      err.textContent = '起始日期无效，请填写合法 年/月/日。';
      return;
    }
    if (!Number.isInteger(offset)) {
      err.textContent = '相隔天数必须是整数（可为负数）。';
      return;
    }

    const target = addDaysUTC(start.y, start.m, start.d, offset);
    const wd = weekday(target.y, target.m, target.d);
    out.innerHTML = [
      `起始日期：${formatYMD(start.y, start.m, start.d)}`,
      `相隔天数：${offset >= 0 ? '+' : ''}${offset} 天`,
      `目标日期：${formatYMD(target.y, target.m, target.d)} (${WEEKDAY_ZH[wd]} / ${WEEKDAY_EN[wd]})`
    ].join('<br>');
  });

  document.getElementById('runSelfTest').addEventListener('click', () => {
    const output = document.getElementById('selfTestOutput');
    const failures = [];

    const weekdayTests = [
      ['1970-01-01', 4], ['2000-01-01', 6], ['2020-02-29', 6], ['2024-02-29', 4], ['2026-03-02', 1],
      ['1900-01-01', 1], ['2100-03-01', 1], ['2023-10-01', 0], ['1999-12-31', 5], ['2016-02-29', 1]
    ];
    weekdayTests.forEach(([date, expected]) => {
      const p = parseYMD(date);
      if (!p) failures.push(`${date} 解析失败`);
      else {
        const got = weekday(p.y, p.m, p.d);
        if (got !== expected) failures.push(`${date} weekday 期望 ${expected} 实际 ${got}`);
      }
    });

    const plus100 = addDaysUTC(2026, 3, 2, 100);
    if (!(plus100.y === 2026 && plus100.m === 6 && plus100.d === 10)) failures.push('2026-03-02 +100 天应为 2026-06-10');

    const cny = isRuleHoliday(2024, 2, 10);
    if (!cny.hit) failures.push('2024-02-10 应判定为春节（农历正月初一）');

    try {
      const cal = parseCalendarJSON(JSON.stringify(sampleCalendar2026));
      calendarData = cal;
      const offDay = calendarDecision(2026, 10, 2);
      const workDay = calendarDecision(2026, 10, 10);
      if (!offDay.isRest) failures.push('2026-10-02 应在 off 中判定为休息日');
      if (workDay.isRest) failures.push('2026-10-10 应在 work 中判定为工作日');
    } catch (e) {
      failures.push(`示例 JSON 自检失败: ${e.message}`);
    }

    output.textContent = failures.length ? `失败 ${failures.length} 项:\n${failures.join('\n')}` : '通过：weekday + 节假日规则 + 日历模式自检全部通过。';
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

  document.getElementById('modeHint').textContent = '规则模式：可预测未来 N 年，不含调休拼假。';
  refreshMetricSelect();
})();
