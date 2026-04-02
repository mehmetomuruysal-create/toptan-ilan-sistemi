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
  const verifyLink = `${baseUrl}/eposta-onay?token=${token}`;

  if (!resend) {
    console.error(`❌ RESEND_API_KEY eksik. E-posta onay linki: ${verifyLink} (gönderilemedi)`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'MMingax <mehmetomuruysal@gmail.com>',
      to: email,
      subject: 'Mingax - E-posta Adresinizi Onaylayın',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Merhaba ${ad},</h2>
          <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
          <a href="${verifyLink}" style="display:inline-block; margin-top:15px; padding:12px 24px; background-color:#16a34a; color:#fff; text-decoration:none; border-radius:6px;">Hesabımı Onayla</a>
          <p style="margin-top:20px; font-size:12px;">Bu işlemi siz yapmadıysanız bu e-postayı dikkate almayın.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Onay maili hatası:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetLink = `${baseUrl}/sifre-yenile?token=${token}`;

  if (!resend) {
    console.error(`❌ RESEND_API_KEY eksik. Şifre sıfırlama linki: ${resetLink} (gönderilemedi)`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <onboarding@resend.dev>',
      to: email,
      subject: 'Mingax - Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Şifre Sıfırlama Talebi</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${resetLink}" style="display:inline-block; margin-top:10px; padding:12px 24px; background-color:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">Şifremi Yenile</a>
          <p style="margin-top:20px; font-size:12px;">Bu talep sizin tarafınızdan yapılmadıysa bu e-postayı dikkate almayın.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Şifre sıfırlama maili hatası:', error);
  }
}

export async function sendWelcomeEmail(email: string, adSoyad: string) {
  if (!resend) {
    console.warn(`⚠️ [TEST MODU] API Key eksik, ${email} adresine hoş geldin maili gönderilmedi.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <onboarding@resend.dev>',
      to: email,
      subject: 'Mingax\'a Hoş Geldiniz!',
      html: `<h2>Merhaba ${adSoyad},</h2><p>Mingax'a başarıyla kayıt oldunuz.</p>`,
    });
  } catch (error) {
    console.error('Hoş geldin maili hatası:', error);
  }
}