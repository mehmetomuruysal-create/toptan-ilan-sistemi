import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export async function sendVerificationEmail(email: string, ad: string, token: string) {
  const baseUrl = getBaseUrl();
  const verifyLink = `${baseUrl}/giris?autoLoginToken=${token}`;

  if (!resend) {
    console.error(`❌ RESEND_API_KEY eksik. Link: ${verifyLink}`);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: 'Mingax <info@mingax.com>',
      to: email,
      subject: 'Mingax - E-posta Adresinizi Onaylayın',
      html: `<div><h2>Merhaba ${ad},</h2><p>Hesabınızı onaylamak için <a href="${verifyLink}">buraya tıklayın</a>.</p></div>`,
    });
    console.log('✅ Onay maili gönderildi:', result);
  } catch (error) {
    console.error('❌ Onay maili hatası:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetLink = `${baseUrl}/sifre-yenile?token=${token}`;

  if (!resend) {
    console.error(`❌ RESEND_API_KEY eksik. Link: ${resetLink}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <info@mingax.com>',
      to: email,
      subject: 'Mingax - Şifre Sıfırlama',
      html: `<div><p>Şifrenizi sıfırlamak için <a href="${resetLink}">tıklayın</a>.</p></div>`,
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
  }
}