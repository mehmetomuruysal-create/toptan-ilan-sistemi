import { Resend } from 'resend';

// Şifreyi almayı dene
const apiKey = process.env.RESEND_API_KEY;

// Eğer şifre verilmemişse sistemi çökertme, sadece boş bırak
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendWelcomeEmail(email: string, adSoyad: string) {
  if (!resend) {
    console.warn(`⚠️[TEST MODU] API Key eksik olduğu için ${email} adresine Hoş Geldin maili gönderilmedi.`);
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
    console.error("E-posta hatası:", error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `http://localhost:3000/sifre-yenile?token=${token}`;
  
  if (!resend) {
    console.warn(`\n=========================================`);
    console.warn(`⚠️ [TEST MODU] E-posta gönderilemedi (API Key Eksik)`);
    console.warn(`🔑 SİSTEME GİRİŞ İÇİN ŞİFRE SIFIRLAMA LİNKİNİZ:`);
    console.warn(`👉 ${resetLink}`);
    console.warn(`=========================================\n`);
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
        </div>
      `,
    });
  } catch (error) {
    console.error("Şifre sıfırlama maili hatası:", error);
  }
}export async function sendVerificationEmail(email: string, ad: string, token: string) {
  const verifyLink = `http://localhost:3000/eposta-onay?token=${token}`;
  
  if (!resend) {
    console.warn(`\n=========================================`);
    console.warn(`⚠️ [TEST MODU] E-posta Onay Maili Gönderilemedi`);
    console.warn(`🔑 HESABI ONAYLAMAK İÇİN TIKLAYIN:`);
    console.warn(`👉 ${verifyLink}`);
    console.warn(`=========================================\n`);
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
    console.error("Onay maili hatası:", error);
  }
}