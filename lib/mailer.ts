import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  const info = await transporter.sendMail({
    from: `"Admin Sistem Informasi Manajemen Posyandu (SIMADU) Puskesmas Cikalapa" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Kode OTP Verifikasi Akun Anda',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>Yth. Pengguna,</p>
        <p>Berikut adalah kode OTP untuk melakukan verifikasi akun Anda di <strong>SIMADU</strong>:</p>
        <h2 style="color: #2E86C1; letter-spacing: 2px;">${otp}</h2>
        <p>Kode ini berlaku selama <strong>10 menit</strong> sejak email ini dikirim.</p>
        <br/>
        <p>Hormat kami,</p>
        <p><strong>SIMADU PKM CIKALAPA</strong></p>
      </div>
    `
  });

  return info;
};
