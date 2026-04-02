const { Resend } = require('resend');

// API key'inizi buraya yazın (Resend Dashboard'dan aldığınız)
const resend = new Resend('re_VWdLCtB1_JGmMYZJjoPkEmZkAiePLd4KE'); 

async function send() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mehmetomuruysal@gmail.com',
      subject: 'Test Local',
      html: '<p>Test</p>',
    });
    if (error) console.error('Hata:', error);
    else console.log('Başarılı:', data);
  } catch (err) {
    console.error('Beklenmeyen hata:', err);
  }
}

send();