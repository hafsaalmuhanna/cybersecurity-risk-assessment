'use strict';

const form = document.getElementById('regForm');
const errorBox = document.getElementById('errorBox');
const submitBtn = document.getElementById('submitBtn');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('hidden');

  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.full_name || !data.full_name.trim()) {
    return showError('يرجى إدخال الاسم الكامل.');
  }
  if (!data.phone || !data.phone.trim()) {
    return showError('يرجى إدخال رقم الهاتف.');
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'جارٍ الإرسال...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) {
      throw new Error(out.error || 'تعذّر إرسال الطلب.');
    }
    document.getElementById('formCard').classList.add('hidden');
    document.getElementById('successCard').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'إرسال طلب التسجيل';
  }
});
