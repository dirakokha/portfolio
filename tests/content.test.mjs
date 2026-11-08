import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const yamlFile = (file) => yaml.load(read(`content/${file}`));

const site = yamlFile('site.yaml');
const contact = yamlFile('contact.yaml');
const projects = yamlFile('projects.yaml');
const experience = yamlFile('experience.yaml');
const skills = yamlFile('skills.yaml');
const certifications = yamlFile('certifications.yaml');
const education = yamlFile('education.yaml');

test('نام انگلیسی دقیقاً همان چیزی است که باید باشد', () => {
  assert.equal(site.identity.name_en, 'AMIRMAHMOUD KHAKNEH');
  assert.equal(site.identity.name_fa, 'امیرمحمود خاکنه');
});

test('شمارهٔ تلفن با فرمت درست و به انتخاب مالک نمایش داده می‌شود', () => {
  assert.equal(typeof contact.phone_visible, 'boolean');
  if (contact.phone_visible) {
    assert.match((contact.phone || '').trim(), /^09\d{9}$/, 'شمارهٔ موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
  }
});

test('هیچ شبکهٔ اجتماعی تأییدنشده‌ای نمایش داده نمی‌شود', () => {
  const socials = contact.socials || [];
  for (const social of socials) {
    assert.equal(social.visible, false, `لینک «${social.label}» بدون تأیید عمومی شده است`);
  }
});

test('هر نمونه‌کار منتشرشده لینک و توضیح واقعی دارد', () => {
  const published = (projects.items || []).filter((item) => item.published);
  for (const project of published) {
    assert.ok(project.title.trim().length > 2, 'عنوان نمونه‌کار لازم است');
    assert.ok(project.summary.trim().length > 20, 'توضیح نمونه‌کار لازم است');
    assert.ok(/^(https?:|\/)/.test(project.demo_url || ''), 'لینک نمونه‌کار لازم است');
  }
});

test('تجربهٔ کاری یک ماه است و ادعای بیشتری ندارد', () => {
  assert.equal(experience.items.length, 1);
  const job = experience.items[0];
  assert.match(job.organization, /مسیر روشن/);
  assert.match(job.duration_label, /یک ماه/);
  assert.ok(!/سال/.test(job.duration_label), 'مدت تجربه نباید سال باشد');
});

test('مهارت‌ها درصد یا سطح جعلی ندارند', () => {
  const states = new Set(['working', 'course', 'learning', 'familiar', 'academic']);
  for (const category of skills.categories) {
    for (const item of category.items) {
      assert.ok(states.has(item.state), `وضعیت نامعتبر: ${item.state}`);
      assert.ok(!/%/.test(item.context || ''), 'درصد مهارت مجاز نیست');
    }
  }
  const flat = JSON.stringify(skills);
  for (const forbidden of ['React', 'Cisco', 'Packet Tracer', 'Node.js']) {
    assert.ok(!flat.includes(forbidden), `مهارت ادعاشده اما تأییدنشده: ${forbidden}`);
  }
});

test('گواهینامه فقط از دادهٔ تأییدشده استفاده می‌کند', () => {
  const verified = /^https:\/\/www\.maktabkhooneh\.org\/certificates\/[A-Za-z0-9-]+$/;
  for (const cert of certifications.items) {
    if (cert.credential_url) {
      assert.match(cert.credential_url, verified, 'لینک تأیید باید همان صفحهٔ رسمی گواهی باشد');
    }
    assert.ok(!cert.certificate_file, 'فایل گواهی ساختگی مجاز نیست');
  }
  const python = certifications.items.find((cert) => /پایتون/.test(cert.title));
  assert.ok(python, 'گواهی پایتون باید در فهرست باشد');
  assert.equal(python.credential_id, 'MK-YM38BP');
  assert.equal(python.credential_url, 'https://www.maktabkhooneh.org/certificates/MK-YM38BP');
  assert.equal(python.instructor, 'جادی میرمیرانی');
  assert.equal(python.duration_label, '۱۸ ساعت');
});

test('تجربهٔ کاری یادداشت توجیهی ندارد', () => {
  for (const job of experience.items) {
    assert.ok(!/حساب شخصی|اینستاگرام و یوتیوب مجموعه/.test(job.note || ''), 'یادداشت اضافه حذف شود');
  }
});

test('تحصیلات مطابق اطلاعات واقعی است', () => {
  assert.equal(education.items.length, 1);
  assert.match(education.items[0].institution, /گسترش انفورماتیک/);
  assert.match(education.items[0].degree, /کاردانی ناپیوسته/);
});

test('ترتیب بخش‌ها معتبر و بدون تکرار است', () => {
  const ids = site.sections.map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.ok(['about', 'skills', 'experience', 'projects', 'education', 'contact'].includes(id));
  }
  assert.ok(ids.includes('contact'), 'بخش تماس باید وجود داشته باشد');
});
