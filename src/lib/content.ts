import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

/**
 * لایهٔ محتوا
 * -----------
 * همهٔ محتوای سایت در پوشهٔ content/ به‌صورت YAML ذخیره می‌شود.
 * این فایل در زمان build خوانده و اعتبارسنجی می‌شود، بنابراین خروجی
 * نهایی کاملاً ایستا است و برای نمایش، هیچ درخواستی به CMS یا هیچ
 * سرویس بیرونی ارسال نمی‌شود.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content');

const itemSchema = z.object({
  name: z.string(),
  name_en: z.string().default(''),
  state: z.enum(['working', 'course', 'learning', 'familiar', 'academic']).default('familiar'),
  context: z.string().default(''),
});

const siteSchema = z.object({
  identity: z.object({
    name_fa: z.string(),
    name_en: z.string(),
    role_fa: z.string().default(''),
    location_fa: z.string().default(''),
    location_en: z.string().default(''),
    available: z.boolean().default(false),
    availability_note: z.string().default(''),
  }),
  hero: z.object({
    kicker: z.string().default(''),
    intro: z.string().default(''),
    primary_cta_label: z.string().default('مشاهدهٔ رزومه'),
    secondary_cta_label: z.string().default('تماس'),
    portrait_image: z.string().default(''),
    portrait_alt: z.string().default('تصویر پرتره'),
    portrait_caption: z.string().default(''),
    highlights: z
      .array(z.object({ label: z.string().default(''), value: z.string().default('') }))
      .default([]),
    ticker: z.string().default(''),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string().default(''),
    keywords: z.string().default(''),
    og_image: z.string().default('/og.png'),
    locale: z.string().default('fa_IR'),
  }),
  sections: z
    .array(
      z.object({
        id: z.enum(['about', 'skills', 'experience', 'projects', 'education', 'contact']),
        label: z.string(),
        visible: z.boolean().default(true),
      }),
    )
    .default([]),
});

const aboutSchema = z.object({
  title: z.string().default('درباره'),
  label_en: z.string().default('About'),
  lead: z.string().default(''),
  paragraphs: z.array(z.string()).default([]),
  facts: z.array(z.object({ label: z.string().default(''), value: z.string().default('') })).default([]),
  quote: z.string().default(''),
});

const contactSchema = z.object({
  email: z.string(),
  email_subject: z.string().default(''),
  phone: z.string().default(''),
  phone_visible: z.boolean().default(false),
  location_label: z.string().default(''),
  response_note: z.string().default(''),
  availability: z.string().default(''),
  socials: z
    .array(
      z.object({
        label: z.string().default(''),
        handle: z.string().default(''),
        url: z.string().default(''),
        visible: z.boolean().default(false),
      }),
    )
    .default([]),
});

const experienceSchema = z.object({
  items: z
    .array(
      z.object({
        organization: z.string(),
        role: z.string(),
        start_label: z.string().default(''),
        end_label: z.string().default(''),
        duration_label: z.string().default(''),
        employment: z.string().default(''),
        location: z.string().default(''),
        summary: z.string().default(''),
        groups: z
          .array(z.object({ title: z.string().default(''), items: z.array(z.string()).default([]) }))
          .default([]),
        note: z.string().default(''),
        tags: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

const skillsSchema = z.object({
  categories: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        label_en: z.string().default(''),
        note: z.string().default(''),
        items: z.array(itemSchema).default([]),
      }),
    )
    .default([]),
});

const educationSchema = z.object({
  items: z
    .array(
      z.object({
        field: z.string(),
        degree: z.string().default(''),
        institution: z.string().default(''),
        period_label: z.string().default(''),
        location: z.string().default(''),
        status: z.string().default(''),
        note: z.string().default(''),
      }),
    )
    .default([]),
});

const certificationsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        provider: z.string().default(''),
        year_label: z.string().default(''),
        status: z.string().default(''),
        certificate_file: z.string().default(''),
        credential_url: z.string().default(''),
        note: z.string().default(''),
      }),
    )
    .default([]),
});

const projectsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        slug: z.string().default(''),
        summary: z.string().default(''),
        year_label: z.string().default(''),
        status: z.string().default(''),
        published: z.boolean().default(false),
        cover_image: z.string().default(''),
        technologies: z.array(z.string()).default([]),
        source_url: z.string().default(''),
        demo_url: z.string().default(''),
      }),
    )
    .default([]),
});

function readYaml<T>(file: string, schema: z.ZodType<T>): T {
  const full = path.join(CONTENT_DIR, file);
  let raw: unknown;
  try {
    raw = yaml.load(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    throw new Error(`خواندن فایل محتوا ناموفق بود: content/${file}\n${(error as Error).message}`);
  }
  const result = schema.safeParse(raw ?? {});
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(ریشه)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`محتوای فایل content/${file} معتبر نیست:\n${issues}`);
  }
  return result.data;
}

export const site = readYaml('site.yaml', siteSchema);
export const about = readYaml('about.yaml', aboutSchema);
export const contact = readYaml('contact.yaml', contactSchema);
export const experience = readYaml('experience.yaml', experienceSchema);
export const skills = readYaml('skills.yaml', skillsSchema);
export const education = readYaml('education.yaml', educationSchema);
export const certifications = readYaml('certifications.yaml', certificationsSchema);
export const projectsRaw = readYaml('projects.yaml', projectsSchema);

/** فقط نمونه‌کارهای منتشرشده به خروجی می‌رسند. */
export const projects = projectsRaw.items.filter((project) => project.published);

/** شمارهٔ تلفن فقط با اجازهٔ صریح مالک سایت نمایش داده می‌شود. */
export const publicPhone = contact.phone_visible && contact.phone.trim() ? contact.phone.trim() : '';

export const socialLinks = contact.socials.filter((social) => social.visible && social.url.trim());

export type SectionId = (typeof site.sections)[number]['id'];

/**
 * ترتیب و نمایش بخش‌ها از پنل مدیریت می‌آید.
 * بخش «نمونه‌کارها» تا وقتی نمونه‌کار منتشرشده‌ای وجود ندارد پنهان می‌ماند،
 * و بخش «تماس» همیشه آخر می‌آید تا مسیر تماس گم نشود.
 */
export function activeSections(): { id: SectionId; label: string; index: number }[] {
  const visible = site.sections.filter((section) => {
    if (!section.visible) return false;
    if (section.id === 'projects' && projects.length === 0) return false;
    return true;
  });
  const contactSection = visible.filter((s) => s.id === 'contact');
  const others = visible.filter((s) => s.id !== 'contact');
  const ordered = [...others, ...contactSection];
  return ordered.map((section, i) => ({ id: section.id, label: section.label, index: i + 1 }));
}

export const stateLabels: Record<string, string> = {
  working: 'در کار واقعی',
  course: 'دوره دیده‌شده',
  learning: 'در حال یادگیری',
  familiar: 'آشنایی مقدماتی',
  academic: 'دانش آکادمیک',
};

