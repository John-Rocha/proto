// Protótipo estático — SIMEX / Definir Alíquota de ICMS e Emitir DAR (HU090/HU091)
// Interatividade ilustrativa: recálculo simples, justificativa, memória de cálculo e confirmação do DAR.

function parseBRL(text) {
  return parseFloat(String(text).replace('R$', '').trim().replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalcRow(row) {
  const baseCell = row.querySelector('[data-field="baseCalculo"]');
  const aliquotaSelect = row.querySelector('[data-field="aliquota"]');
  const icmsCalcCell = row.querySelector('[data-field="icmsCalculado"]');
  const icmsDevidoCell = row.querySelector('[data-field="icmsDevido"]');

  const base = parseBRL(baseCell.textContent);
  const aliquota = parseFloat(aliquotaSelect.value);

  const icms = base * (aliquota / 100);

  icmsCalcCell.textContent = formatBRL(icms);
  icmsDevidoCell.textContent = formatBRL(icms);
}

function recalcTotals() {
  let totalIcms = 0;
  let totalSt = 0;

  document.querySelectorAll('.row-item').forEach((row) => {
    totalIcms += parseBRL(row.querySelector('[data-field="icmsDevido"]').textContent);
    totalSt += parseBRL(row.querySelector('[data-field="icmsSt"]').textContent);
  });

  const total = totalIcms + totalSt;

  document.getElementById('total-icms').textContent = 'R$ ' + formatBRL(totalIcms);
  document.getElementById('total-st').textContent = 'R$ ' + formatBRL(totalSt);
  document.getElementById('total-geral').textContent = 'R$ ' + formatBRL(total);

  document.getElementById('summary-icms').textContent = 'R$ ' + formatBRL(totalIcms);
  document.getElementById('summary-st').textContent = 'R$ ' + formatBRL(totalSt);
  document.getElementById('summary-total').textContent = 'R$ ' + formatBRL(total);
  document.getElementById('modal-total-dar').textContent = 'R$ ' + formatBRL(total);
  document.getElementById('modal-icms-total').textContent = 'R$ ' + formatBRL(totalIcms);
}

function showChangeJustification() {
  const card = document.getElementById('justificativa-card');
  if (!card) return;
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function init() {
  // Recalcular ao trocar alíquota e exigir justificativa da alteração.
  document.querySelectorAll('[data-field="aliquota"]').forEach((select) => {
    select.addEventListener('change', () => {
      const row = select.closest('.row-item');
      recalcRow(row);
      recalcTotals();
      showChangeJustification();
    });
  });

  // Alteração de benefício também exige justificativa.
  document.querySelectorAll('[data-field="beneficio"]').forEach((select) => {
    select.addEventListener('change', showChangeJustification);
  });

  // Expandir/recolher linha de detalhe.
  document.querySelectorAll('.expand-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const detailRow = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      const isHidden = detailRow.style.display === 'none';
      detailRow.style.display = isHidden ? 'table-row' : 'none';
      if (icon) {
        icon.classList.toggle('pi-plus', !isHidden);
        icon.classList.toggle('pi-minus', isHidden);
      }
    });
  });

  // Memória de cálculo.
  document.getElementById('btn-memoria-calculo')?.addEventListener('click', () => openModal('modal-memoria'));
  document.getElementById('btn-fechar-memoria')?.addEventListener('click', () => closeModal('modal-memoria'));
  document.getElementById('btn-ok-memoria')?.addEventListener('click', () => closeModal('modal-memoria'));

  // Emitir DAR -> abre confirmação antes de exibir status.
  const btnEmitir = document.getElementById('btn-emitir-dar');
  const statusCard = document.getElementById('dar-status-card');
  btnEmitir?.addEventListener('click', () => openModal('modal-confirmar-dar'));
  document.getElementById('btn-cancelar-dar')?.addEventListener('click', () => closeModal('modal-confirmar-dar'));
  document.getElementById('btn-cancelar-dar-x')?.addEventListener('click', () => closeModal('modal-confirmar-dar'));
  document.getElementById('btn-confirmar-dar')?.addEventListener('click', () => {
    closeModal('modal-confirmar-dar');
    statusCard.style.display = 'block';
    statusCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Fechar modal clicando fora.
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });

  // Toggle da sidebar.
  const btnToggleMenu = document.getElementById('btn-toggle-menu');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  btnToggleMenu?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
  });

  // Toggle do grupo "Parâmetros Fiscais" no menu.
  const btnToggleParametrosFiscais = document.getElementById('btn-toggle-parametros-fiscais');
  const submenuParametrosFiscais = document.getElementById('submenu-parametros-fiscais');
  btnToggleParametrosFiscais?.addEventListener('click', () => {
    const expanded = btnToggleParametrosFiscais.getAttribute('aria-expanded') === 'true';
    btnToggleParametrosFiscais.setAttribute('aria-expanded', String(!expanded));
    submenuParametrosFiscais.classList.toggle('collapsed', expanded);
  });

  recalcTotals();
}

document.addEventListener('DOMContentLoaded', init);
