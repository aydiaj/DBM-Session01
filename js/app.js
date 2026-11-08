(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const lessons = [
    ['Course welcome & syllabus', 20, 'Orient'],
    ['Recall DB2: SQL & SSMS', 10, 'Recall'],
    ['From query to C# application', 10, 'Predict'],
    ['SSMS vs ADO.NET vs EF Core', 15, 'Compare'],
    ['Why EF Core later?', 15, 'Explain'],
    ['ADO.NET: first components', 15, 'Explore'],
    ['First C# Console app', 30, 'Practice'],
    ['Review & what’s next', 5, 'Reflect']
  ];
  const STORAGE_KEY = 'tvet-dbm-session01-orientation-ado-v3';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { }
  let done = Array.isArray(saved.done) ? [...new Set(saved.done.filter(x => Number.isInteger(x) && x >= 0 && x < lessons.length))] : [];
  let current = /^[0-7]$/.test(location.hash.slice(1)) ? Number(location.hash.slice(1)) : 0;
  let syllabusActive = false;
  let confirmedComplete = false;
  const correctlyAnswered = new Set();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ done, theme: document.documentElement.dataset.theme })); } catch (_) { }
  }
  function announce(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(announce.timeout);
    announce.timeout = setTimeout(() => { toast.hidden = true; }, 2500);
  }
  function toggleMenu(show) {
    const sidebar = $('#sidebar');
    sidebar.classList.toggle('open', Boolean(show));
    $('#scrim').hidden = !show;
    $('#menuBtn').setAttribute('aria-expanded', String(Boolean(show)));
  }
  $('#menuBtn').addEventListener('click', () => toggleMenu(!$('#sidebar').classList.contains('open')));
  $('#closeMenu').addEventListener('click', () => toggleMenu(false));
  $('#scrim').addEventListener('click', () => toggleMenu(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      toggleMenu(false);
      if (!$('#completion').hidden) $('#completion').hidden = true;
    }
  });
  function setTheme(mode) {
    document.documentElement.dataset.theme = mode;
    $('#themeBtn').textContent = mode === 'dark' ? '☀' : '◐';
    $('#themeBtn').setAttribute('aria-label', `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`);
    persist();
  }
  setTheme(saved.theme === 'dark' ? 'dark' : 'light');
  $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  lessons.forEach(([title, duration, action], i) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `<b>${String(i + 1).padStart(2, '0')} · ${duration} MIN</b><strong>${title}</strong><small>${action}</small>`;
    $('#timeline').append(item);
  });
  function showProgress() {
    const count = done.length;
    const percentage = Math.round(count / lessons.length * 100);
    $('#progressText').textContent = `${count} / ${lessons.length}`;
    $('#progressFill').style.width = `${percentage}%`;
    $('#progressBar').setAttribute('aria-valuenow', String(percentage));
    $$('.step-link').forEach((button, i) => button.classList.toggle('done', done.includes(i)));
  }
  function showStep(index, options = {}) {
    syllabusActive = false;
    current = Math.max(0, Math.min(lessons.length - 1, Number(index) || 0));
    $('#viewLabel').textContent = 'SESSION 01';
    $('.lesson-footer').hidden = false;
    $$('.lesson').forEach(panel => {
      const active = panel.dataset.panel === String(current);
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    $$('.step-link').forEach((button, i) => {
      const active = i === current;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    $('#footerCount').textContent = `STEP ${String(current + 1).padStart(2, '0')} OF 08`;
    $('#footerTime').textContent = `${lessons[current][1]}-minute segment`;
    $('#completeBtn').classList.toggle('done', done.includes(current));
    $('#completeBtn').setAttribute('aria-pressed', String(done.includes(current)));
    $('#completeBtn').textContent = done.includes(current) ? '✓ Completed' : '✓ Mark completed';
    $('#previousBtn').disabled = current === 0;
    $('#nextBtn').textContent = current === lessons.length - 1 ? 'Finish lesson ✓' : 'Next step →';
    const target = `#${current}`;
    if (location.hash !== target) {
      if (options.replace) history.replaceState(null, '', target);
      else history.pushState(null, '', target);
    }
    toggleMenu(false);
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: 'instant' });
    showProgress();
  }
  function showSyllabus(options = {}) {
    syllabusActive = true;
    $$('.lesson').forEach(panel => {
      const active = panel.dataset.panel === 'syllabus';
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    $$('.step-link').forEach(button => {
      button.classList.remove('active');
      button.removeAttribute('aria-current');
    });
    $('.lesson-footer').hidden = true;
    $('#viewLabel').textContent = 'SYLLABUS & ROADMAP';
    if (location.hash !== '#syllabus') {
      if (options.replace) history.replaceState(null, '', '#syllabus');
      else history.pushState(null, '', '#syllabus');
    }
    toggleMenu(false);
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: 'instant' });
  }
  $$('.step-link').forEach(button => button.addEventListener('click', () => showStep(button.dataset.step)));
  $('#previousBtn').addEventListener('click', () => showStep(current - 1));
  $('#nextBtn').addEventListener('click', () => {
    if (current < lessons.length - 1) { showStep(current + 1); return; }
    if (done.length !== lessons.length) {
      announce(`${lessons.length - done.length} step(s) still need to be marked completed.`);
      return;
    }
    confirmedComplete = true;
    $('#completion').hidden = false;
    $('#closeCompletion').focus();
  });
  $('#completeBtn').addEventListener('click', () => {
    done = done.includes(current) ? done.filter(i => i !== current) : [...done, current].sort((a,b) => a - b);
    persist();
    showProgress();
    $('#completeBtn').classList.toggle('done', done.includes(current));
    $('#completeBtn').setAttribute('aria-pressed', String(done.includes(current)));
    $('#completeBtn').textContent = done.includes(current) ? '✓ Completed' : '✓ Mark completed';
    announce(done.includes(current) ? 'Progress saved.' : 'Marked incomplete.');
    // Intentionally do not navigate or scroll when marking complete.
    if (done.length === lessons.length && !confirmedComplete) {
      confirmedComplete = true;
      $('#completion').hidden = false;
      $('#closeCompletion').focus();
    }
  });
  $('#closeCompletion').addEventListener('click', () => { $('#completion').hidden = true; $('#completeBtn').focus(); });
  $('#syllabusShortcut').addEventListener('click', event => { event.preventDefault(); showSyllabus(); });
  $('#openRoadmap').addEventListener('click', () => showSyllabus());
  $('#returnToLesson').addEventListener('click', () => showStep(current));
  $('#worksheetShortcut').addEventListener('click', () => showStep(7));
  $('#resetProgress').addEventListener('click', () => {
    if (!window.confirm('Reset completion checkmarks for Session 01?')) return;
    done = []; confirmedComplete = false;
    persist(); showStep(0, { replace: true }); announce('Progress reset.');
  });
  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    if (hash === 'syllabus') showSyllabus({ scroll: false, replace: true });
    else showStep(/^[0-7]$/.test(hash) ? Number(hash) : 0, { scroll: false, replace: true });
  });

  function singleQuestion(name, correct, explanations) {
    const container = $(`[data-quiz="${name}"]`);
    container.addEventListener('click', event => {
      const button = event.target.closest('button[data-choice]');
      if (!button) return;
      const choice = button.dataset.choice;
      container.querySelectorAll('button').forEach(item => item.classList.remove('is-correct','is-wrong'));
      button.classList.add(choice === correct ? 'is-correct' : 'is-wrong');
      const feedback = $(`#${name}Feedback`);
      feedback.textContent = explanations[choice];
      feedback.className = 'feedback ' + (choice === correct ? 'success' : 'error');
    });
  }
  singleQuestion('recall', 'b', {
    a: 'SSMS displays and submits your query, but the SQL Server engine executes it.',
    b: 'Correct. SQL Server evaluates the statement and returns the result set to the client.',
    c: 'SQL is the language of the request; it is not a running database server.'
  });
  $('#revealBridge').addEventListener('click', () => {
    $('#bridgeSlot').textContent = 'ADO.NET / SqlClient';
    $('#bridgeSlot').classList.remove('bridge-missing');
    $('#bridgeSlot').classList.add('bridge-shown');
    $('#bridgeFeedback').textContent = 'ADO.NET through Microsoft.Data.SqlClient lets C# connect, issue SQL and receive results. The running Console program does not require SSMS.';
    $('#bridgeFeedback').className = 'feedback success';
  });
  const scenarios = [
    {prompt:'You want to manually inspect table contents and run an SQL script.', answer:'ssms',why:'SSMS is the graphical tool for your manual SQL Server work.'},
    {prompt:'Your first Console app needs explicit SqlConnection and SqlCommand objects.',answer:'ado',why:'ADO.NET exposes the connection and command objects through the SQL Server provider.'},
    {prompt:'Later, your C# app needs mapped Student objects, LINQ and change tracking.',answer:'ef',why:'EF Core is the ORM. For SQL Server it uses a provider built on lower-level ADO.NET access.'}
  ];
  let selectedScenario = 0;
  function showScenario(index) {
    selectedScenario = index;
    $$('.scenario-tabs button').forEach(button => {
      const active = Number(button.dataset.scenario) === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#scenarioPrompt').textContent = scenarios[index].prompt;
    $('#toolMatchFeedback').textContent = 'Choose a technology and read the explanation.';
    $('#toolMatchFeedback').className = 'feedback';
    $$('#toolMatch button').forEach(button => button.classList.remove('is-correct','is-wrong'));
  }
  $$('.scenario-tabs button').forEach(button => button.addEventListener('click', () => showScenario(Number(button.dataset.scenario))));
  $$('#toolMatch button').forEach(button => button.addEventListener('click', () => {
    const correct = button.dataset.tool === scenarios[selectedScenario].answer;
    $$('#toolMatch button').forEach(item => item.classList.remove('is-correct', 'is-wrong'));
    button.classList.add(correct ? 'is-correct' : 'is-wrong');
    $('#toolMatchFeedback').textContent = `${correct ? 'Correct. ' : 'Try again. '}${scenarios[selectedScenario].why}`;
    $('#toolMatchFeedback').className = 'feedback ' + (correct ? 'success' : 'error');
  }));
  showScenario(0);
  const modeInfo = {
    direct: '<div class="data-flow"><div class="flow-line"><span class="flow-node">C# Console</span><span>→</span><span class="flow-node">ADO.NET / SqlClient</span><span>→</span><span class="flow-node engine">SQL Server</span></div></div><p>With ADO.NET, your C# code explicitly creates connections, commands and reads results.</p>',
    orm: '<div class="data-flow"><div class="flow-line"><span class="flow-node">C# Console + entities</span><span>→</span><span class="flow-node">EF Core + SQL Server provider</span><span>→</span><span class="flow-node">ADO.NET / SqlClient</span><span>→</span><span class="flow-node engine">SQL Server</span></div></div><p>EF Core maps objects and generates SQL, while still relying on lower-level provider access to SQL Server. This is a concept preview for Week 2.</p>'
  };
  $$('[data-mode]').forEach(button => button.addEventListener('click', () => {
    $$('[data-mode]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    $('#modeDiagram').innerHTML = modeInfo[button.dataset.mode];
  }));
  const stages = [
    ['1 · SqlConnection', 'Represents the selected SQL Server instance and database. Creating the object does not yet establish the connection.'],
    ['2 · OpenAsync', 'Opens the connection. Server availability, authentication and access permissions matter here.'],
    ['3 · SqlCommand', 'Associates a SQL statement with the opened connection so the engine can execute it.'],
    ['4 · ExecuteScalarAsync', 'Returns one value from the first column of the first row. SELECT COUNT(*) is a simple demonstration.'],
    ['5 · Dispose', 'await using closes and disposes the connection and command when the scope ends, including when an exception occurs.']
  ];
  $$('[data-stage]').forEach(button => button.addEventListener('click', () => {
    const i = Number(button.dataset.stage);
    $$('[data-stage]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    $('#pipelineExplanation').innerHTML = `<strong>${stages[i][0]}</strong><p>${stages[i][1]}</p>`;
  }));
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const content = document.getElementById(button.dataset.copy)?.textContent;
    if (!content) return;
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try { await navigator.clipboard.writeText(content); copied = true; } catch (_) { }
    }
    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed'; textarea.style.opacity = '0';
      document.body.append(textarea); textarea.select();
      try { copied = document.execCommand('copy'); } catch (_) { }
      textarea.remove();
    }
    announce(copied ? 'Code copied.' : 'Select the code and copy it manually.');
  }));
  const quizQuestions = [
    {q:'Which component actually executes T-SQL?',choices:['SQL Server','SSMS','C# Console'],answer:0,why:'SQL Server is the database engine. SSMS and your Console app are clients.'},
    {q:'Which technology is used for your first C# Console connection?',choices:['EF Core LINQ','ADO.NET via SqlClient','SSMS embedded in C#'],answer:1,why:'SqlConnection and SqlCommand come from Microsoft.Data.SqlClient, an ADO.NET provider.'},
    {q:'What does ExecuteScalarAsync return for SELECT COUNT(*)?',choices:['The complete database','One scalar value','A user interface'],answer:1,why:'The SQL expression returns a count, and ExecuteScalarAsync obtains the first value.'},
    {q:'Why will we study EF Core after ADO.NET?',choices:['EF removes SQL Server','EF can map objects and reduce repetitive code','EF is another name for SSMS'],answer:1,why:'EF Core provides an ORM layer, but it still relies on the SQL Server provider and lower-level access.'},
    {q:'What type of program are we building in DB3 labs?',choices:['A C# Console application','A desktop GUI','An ASP.NET Core website'],answer:0,why:'The DB3 labs use Console apps; the parallel Web and later desktop courses cover interfaces.'}
  ];
  quizQuestions.forEach((question, index) => {
    const card = document.createElement('div'); card.className = 'quiz-card';
    const heading = document.createElement('strong'); heading.textContent = `${index + 1}. ${question.q}`; card.append(heading);
    const options = document.createElement('div'); options.className = 'quiz-options';
    const feedback = document.createElement('p'); feedback.className = 'quiz-explain'; feedback.setAttribute('aria-live','polite');
    question.choices.forEach((text, choice) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
      button.addEventListener('click', () => {
        options.querySelectorAll('button').forEach(item => item.classList.remove('is-correct','is-wrong'));
        const correct = choice === question.answer;
        button.classList.add(correct ? 'is-correct' : 'is-wrong');
        feedback.textContent = `${correct ? 'Correct. ' : 'Not quite. '}${question.why}`;
        if (correct) correctlyAnswered.add(index); else correctlyAnswered.delete(index);
        $('#quizStatus').textContent = `${correctlyAnswered.size} of ${quizQuestions.length} questions answered correctly.`;
      });
      options.append(button);
    });
    card.append(options, feedback); $('#finalQuiz').append(card);
  });
  if (location.hash.slice(1) === 'syllabus') showSyllabus({ scroll: false, replace: true });
  else showStep(current, { scroll: false, replace: true });
})();
