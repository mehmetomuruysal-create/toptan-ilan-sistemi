import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Production base URL (NEXTAUTH_URL zaten Vercel'de tanımlı olmalı)
const BASE_URL = process.env.NEXTAUTH_URL || 'https://toptan-ilan-sistemi.vercel.app';

export async function sendWelcomeEmail(email: string, adSoyad: string) {
  if (!resend) {
    console.error(`❌ E-posta gönderilemedi: RESEND_API_KEY tanımlı değil.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <onboarding@resend.dev>',
      to: email,
      subject: 'Mingax\'a Hoş Geldiniz!',
      html: `<h2>Merhaba ${adSoyad},</h2><p>Mingax profesyonel toptan alışveriş platformuna başarıyla kayıt oldunuz!</p>`,
    });
  } catch (error) {
    console.error('Hoş geldin maili hatası:', error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${BASE_URL}/sifre-yenile?token=${token}`;

  if (!resend) {
    console.error(`❌ Şifre sıfırlama e-postası gönderilemedi: RESEND_API_KEY tanımlı değil.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <onboarding@resend.dev>',
      to: email,
      subject: 'Mingax - Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #111;">Şifre Sıfırlama Talebi</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${resetLink}" style="display:inline-block; margin-top:10px; padding:12px 24px; background-color:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Şifremi Yenile</a>
          <p style="margin-top:20px; font-size:12px;">Bu talep sizin tarafınızdan yapılmadıysa bu e-postayı dikkate almayın.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Şifre sıfırlama maili hatası:', error);
  }
}

export async function sendVerificationEmail(email: string, ad: string, token: string) {
  const verifyLink = `${BASE_URL}/eposta-onay?token=${token}`;

  if (!resend) {
    console.error(`❌ E-posta doğrulama e-postası gönderilemedi: RESEND_API_KEY tanımlı değil.`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Mingax <onboarding@resend.dev>',
      to: email,
      subject: 'Mingax - Lütfen E-posta Adresinizi Onaylayın',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Merhaba ${ad},</h2>
          <p>Mingax'a kayıt olduğunuz için teşekkürler. Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
          <a href="${verifyLink}" style="display:inline-block; margin-top:15px; padding:12px 24px; background-color:#16a34a; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Hesabımı Onayla</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Bu işlemi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Onay maili hatası:', error);
  }
}